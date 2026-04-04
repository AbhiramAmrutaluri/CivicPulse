import json
import logging
import argparse
import sys
import time
import requests  # type: ignore
from kafka import KafkaConsumer, KafkaProducer  # type: ignore
from kafka.errors import NoBrokersAvailable  # type: ignore
from datetime import datetime

# 1. Production-style Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("CivicPulseConsumer")

# 2. Backend WebSocket Broadcast URL
BACKEND_BROADCAST_URL = "http://localhost:8000/ws/trigger-event"
BROADCAST_TIMEOUT = 2  # seconds

# 2. Validation Logic Constants
REQUIRED_FIELDS = [
    "complaint_id", "source", "citizen_name", "language",
    "original_text", "ward", "location", "created_at"
]

def validate_complaint(record):
    """
    Validates incoming JSON structurally and semantically before NLP pipeline.
    Returns: (bool is_valid, str error_message_if_any)
    """
    if not isinstance(record, dict):
        return False, "Payload is not a valid JSON document."
        
    for field in REQUIRED_FIELDS:
        if field not in record or not str(record[field]).strip():
            return False, f"Missing or empty required field: '{field}'"
            
    # Example semantic validation
    if len(str(record.get('complaint_id', ''))) < 10:
        return False, "Invalid 'complaint_id' format (too short)."
        
    return True, None

def get_kafka_producer(bootstrap_servers):
    """Returns a resilient producer for downstream and dead-letter topics."""
    try:
        return KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all',
            retries=3
        )
    except NoBrokersAvailable as e:
        logger.error(f"Downstream Producer connection failed: {e}")
        sys.exit(1)

def robust_json_deserializer(raw_bytes):
    """Safely decodes JSON, returning a dict or an error string for downstream handling."""
    try:
        return json.loads(raw_bytes.decode('utf-8'))
    except Exception as e:
        return f"ERROR_PARSING:{str(e)}"

def broadcast_to_websocket(complaint_data: dict):
    """
    Broadcasts validated complaint to all connected WebSocket clients asynchronously.
    Non-blocking: failures don't crash the consumer.
    """
    try:
        # Smart categorization based on text content if category not available
        def infer_category(text: str) -> str:
            text_lower = text.lower()
            if any(word in text_lower for word in ['pothole', 'road', 'pavement', 'street', 'traffic', 'highway']):
                return 'Roads'
            elif any(word in text_lower for word in ['water', 'pipe', 'contaminated', 'supply']):
                return 'Water'
            elif any(word in text_lower for word in ['garbage', 'waste', 'sanitation', 'dump', 'litter']):
                return 'Sanitation'
            elif any(word in text_lower for word in ['power', 'electric', 'light', 'line', 'electricity']):
                return 'Electricity'
            elif any(word in text_lower for word in ['drain', 'drainage', 'sewage', 'overflow']):
                return 'Drainage'
            return 'Other'

        def infer_urgency(text: str) -> str:
            text_lower = text.lower()
            if any(word in text_lower for word in ['critical', 'emergency', 'severe', 'dangerous', 'blocked', 'choking']):
                return 'Critical'
            elif any(word in text_lower for word in ['high', 'urgent', 'urgent', 'serious']):
                return 'High'
            elif any(word in text_lower for word in ['medium', 'moderate']):
                return 'Medium'
            return 'Low'

        original_text = complaint_data.get("original_text", "")
        category = complaint_data.get("category") or infer_category(original_text)
        urgency = complaint_data.get("urgency") or infer_urgency(original_text)
        
        # Format event for frontend
        event_payload = {
            "event_type": "NEW_COMPLAINT",
            "payload": {
                "id": str(complaint_data.get("complaint_id", "UNKNOWN"))[:8],  # type: ignore
                "citizen_name": complaint_data.get("citizen_name", "Anonymous"),
                "language": complaint_data.get("language", "en"),
                "original_text": original_text,
                "translated_text": complaint_data.get("translated_text", original_text),
                "ward": complaint_data.get("ward", "Unknown"),
                "location": complaint_data.get("location", "Unknown"),
                "category": category,
                "urgency": urgency,
                "department": complaint_data.get("department", "Unassigned"),
                "status": "Pending",
                "created_at": complaint_data.get("created_at", datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"))
            }
        }
        
        response = requests.post(
            BACKEND_BROADCAST_URL,
            json=event_payload,
            timeout=BROADCAST_TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            clients_reached = data.get("connected_clients_reached", 0)
            if clients_reached > 0:
                c_id = str(complaint_data.get('complaint_id', 'UNKNOWN'))[:8]  # type: ignore
                logger.info(f"📡 Broadcast Success | Complaint ID: {c_id} | Clients Reached: {clients_reached}")
        else:
            logger.warning(f"Broadcast failed with status {response.status_code}")
            
    except requests.exceptions.Timeout:
        logger.warning(f"Broadcast timeout - backend may be slow or unavailable")
    except requests.exceptions.ConnectionError:
        logger.warning(f"Cannot reach backend at {BACKEND_BROADCAST_URL} - WebSocket broadcast skipped")
    except Exception as e:
        logger.warning(f"Broadcast error (non-fatal): {e}")


def run_consumer(servers, input_topic, valid_topic, dlq_topic):
    """
    Main loop: Reads raw complaints, validates them, and routes them to 
    either the PySpark ready queue or Dead Letter Queue.
    """
    # Initialize downstream Kafka producer
    downstream_producer = get_kafka_producer(servers)
    
    # Initialize Kafka consumer with automatic offset commits
    while True:
        try:
            logger.info(f"Connecting to Kafka brokers at {servers}...")
            consumer = KafkaConsumer(
                input_topic,
                bootstrap_servers=servers,
                auto_offset_reset='earliest', # Only useful on first startup
                enable_auto_commit=True,      # Automatically bookmark progress
                group_id='civicpulse_validation_group', # Allows multiple consumers to load balance
                value_deserializer=robust_json_deserializer
            )
            logger.info(f"Subscribed to topic '{input_topic}'. Listening for complaints...")
            break
        except NoBrokersAvailable:
            logger.warning("Broker unavailable. Retrying in 5 seconds...")
            time.sleep(5)
            
    valid_count: int = 0
    error_count: int = 0

    try:
        for message in consumer:
            raw_record = message.value
            
            # --- Handle JSON Parsing Failures ---
            if isinstance(raw_record, str) and raw_record.startswith("ERROR_PARSING"):
                logger.warning(f"Malformed JSON trapped! Sending to DLQ. Raw: {message.value}")
                error_payload = {
                    "error_type": "JSON_PARSE_FAILED",
                    "raw_offset": message.offset,
                    "raw_bytes": str(message.value)
                }
                downstream_producer.send(dlq_topic, value=error_payload)
                error_count = error_count + 1  # type: ignore
                continue

            # --- Structural Validation ---
            is_valid, error_msg = validate_complaint(raw_record)
            
            if is_valid:
                # Append a pipeline audit trace
                raw_record["pipeline_stage"] = "VALIDATED"
                raw_record["validated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
                
                # Send to PySpark / NLP processing
                downstream_producer.send(valid_topic, value=raw_record)
                valid_count = valid_count + 1  # type: ignore
                
                # **NEW**: Broadcast to WebSocket for real-time dashboard
                broadcast_to_websocket(raw_record)
                
                if valid_count % 10 == 0:
                    logger.info(f"✅ Route Success: Validated {valid_count} incoming complaints.")
            else:
                # --- Send to Dead Letter Queue (DLQ) ---
                logger.error(f"❌ Route Failure: {error_msg} | ID: {raw_record.get('complaint_id', 'UNKNOWN')}")
                raw_record["error_reason"] = error_msg
                downstream_producer.send(dlq_topic, value=raw_record)
                error_count = error_count + 1  # type: ignore
                
    except KeyboardInterrupt:
        logger.info("\nGraceful shutdown initiated by user (Ctrl+C).")
    except Exception as e:
        logger.error(f"Unexpected pipeline exception: {e}")
    finally:
        logger.info("Closing connections and flushing pending events...")
        consumer.close()
        downstream_producer.flush()
        downstream_producer.close()
        logger.info(f"--- SESSION SUMMARY ---")
        logger.info(f"Total Validated: {valid_count}")
        logger.info(f"Total DLQ Errors: {error_count}")
        logger.info("Exit successful.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CivicPulse AI: Streaming Pre-processor")
    parser.add_argument('--servers', default='localhost:9092', help='Kafka bootstrap servers')
    parser.add_argument('--in-topic', default='citizen_complaints_raw', help='Incoming unverified topic')
    parser.add_argument('--valid-topic', default='citizen_complaints_validated', help='Clean topic for PySpark/NLP')
    parser.add_argument('--dlq-topic', default='citizen_complaints_dlq', help='Dead-letter queue for errors')
    
    args = parser.parse_args()
    
    run_consumer(args.servers, args.in_topic, args.valid_topic, args.dlq_topic)
