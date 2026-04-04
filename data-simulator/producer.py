import csv
import json
import logging
import argparse
import time
import sys
import uuid
from datetime import datetime
from kafka import KafkaProducer  # type: ignore
from kafka.errors import NoBrokersAvailable  # type: ignore

# Set up logging: Production-style logging with timestamp and level
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("CivicPulseProducer")

def get_kafka_producer(bootstrap_servers, retries=5):
    """
    Creates and returns a KafkaProducer instance with resilience built-in.
    """
    for attempt in range(retries):
        try:
            logger.info(f"Connecting to Kafka at {bootstrap_servers}... (Attempt {attempt + 1}/{retries})")
            producer = KafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                acks='all',        # Wait for all replicas to acknowledge
                retries=3,         # Retry failed transient messages 3 times
                linger_ms=10,      # Slightly batch messages for performance
                client_id='civicpulse_ingestion_producer'
            )
            logger.info("Successfully connected to Kafka brokers!")
            return producer
        except NoBrokersAvailable as e:
            logger.warning(f"Broker not available: {e}. Retrying in 5 seconds...")
            time.sleep(5)
    
    logger.error("Failed to connect to Kafka. Please ensure Zookeeper and Kafka are running.")
    sys.exit(1)

def on_send_success(record_metadata):
    """Optional callback for successful message delivery (kept quiet to avoid log spam)."""
    pass

def on_send_error(excp):
    """Callback for failed message delivery."""
    logger.error(f"Failed to deliver message to Kafka: {excp}")

def run_producer(input_csv, topic, servers, delay_sec):
    """
    Reads the CSV and streams huge batches infinitely into Kafka every 40-80 seconds.
    """
    import random
    producer = get_kafka_producer(servers)
    count = 0
    logger.info(f"Starting raw complaint ingestion to topic: '{topic}'")
    
    try:
        with open(input_csv, mode='r', encoding='utf-8') as file:
            rows = list(csv.DictReader(file))
            
        if not rows:
            logger.error("CSV file is empty! Please populate it first.")
            return

            logger.info(f"Loaded {len(rows)} source complaints. Entering endless live simulation mode (Batches every 40-60s)...")
        
        while True:
            # Generate a "huge" batch size (e.g. 20 to 80 complaints at once)
            batch_size = random.randint(50, 150)
            logger.info(f"🚀 Generating live burst of {batch_size} AI-simulated complaints...")
            
            for _ in range(batch_size):
                row = random.choice(rows)
                
                # We dynamically update the timestamp to right NOW to make it truly realistic and 'live'
                payload = {
                    "complaint_id": f"SIM-{str(uuid.uuid4().hex)[:8].upper()}",  # type: ignore
                    "source": row.get("source"),
                    "citizen_name": row.get("citizen_name"),
                    "language": row.get("language"),
                    "original_text": row.get("original_text"),
                    "translated_text": row.get("translated_text"),
                    "ward": row.get("ward"),
                    "location": row.get("location"),
                    "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                
                # Asynchronous send
                future = producer.send(topic, value=payload)
                future.add_callback(on_send_success).add_errback(on_send_error)
                count += 1
            
            producer.flush()
            logger.info(f"✅ Successfully flushed {batch_size} live complaints to Kafka! (Total sent: {count})")
            
            # Wait 40-60 seconds before next massive pulse
            sleep_time = random.uniform(40, 60)
            logger.info(f"💤 Next massive data pulse in {int(sleep_time)} seconds...\n")
            time.sleep(sleep_time)

    except FileNotFoundError:
        logger.error(f"Input file '{input_csv}' not found. Please run generator.py first to create the dataset.")
    except KeyboardInterrupt:
        logger.info("Simulation halted by user.")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
    finally:
        logger.info("Flushing remaining messages to broker...")
        producer.flush()
        producer.close()
        logger.info(f"Finished publishing {count} complaints. Ingestion complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CivicPulse AI: Kafka Ingestion Producer")
    parser.add_argument('--file', type=str, default='civicpulse_sample.csv', help='Path to dataset')
    parser.add_argument('--topic', type=str, default='citizen_complaints_raw', help='Kafka topic name')
    parser.add_argument('--servers', type=str, default='localhost:9092', help='Kafka bootstrap servers')
    parser.add_argument('--delay', type=float, default=1.0, help='Delay in seconds (0 for immediate burst)')
    
    args = parser.parse_args()
    
    run_producer(args.file, args.topic, args.servers, args.delay)
