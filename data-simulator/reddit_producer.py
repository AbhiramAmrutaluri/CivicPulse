import time
import json
import logging
import random
import argparse
from datetime import datetime
import praw # type: ignore
from kafka import KafkaProducer # type: ignore
from kafka.errors import NoBrokersAvailable # type: ignore

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("RedditLiveProducer")

# =========================================================================
# 🔴 PUT YOUR REDDIT API CREDENTIALS HERE
# =========================================================================
REDDIT_CLIENT_ID = "YOUR_CLIENT_ID_HERE"
REDDIT_CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE"
REDDIT_USER_AGENT = "script:civicpulse.ai:v1.0 (by /u/YOUR_REDDIT_USERNAME)"
# =========================================================================

# Subreddits to track for city/municipal data
TARGET_SUBREDDITS = "mumbai+delhi+bangalore+hyderabad+chennai+india"
# Keywords to filter out actual complaints/grievances from general chatter
GRIEVANCE_KEYWORDS = [
    'pothole', 'road', 'traffic', 'power', 'electricity', 'water', 'garbage', 
    'trash', 'stray', 'sewage', 'drain', 'bribe', 'police', 'municipal'
]

def get_kafka_producer(servers):
    try:
        producer = KafkaProducer(
            bootstrap_servers=servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all',
            client_id='civicpulse_reddit_producer'
        )
        logger.info("✅ Connected to Kafka!")
        return producer
    except NoBrokersAvailable:
        logger.error("❌ Failed to connect to Kafka. Is Docker running?")
        exit(1)

def is_grievance(text):
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in GRIEVANCE_KEYWORDS)

def stream_reddit_data(servers, topic):
    producer = get_kafka_producer(servers)
    
    logger.info("Connecting to Reddit API...")
    try:
        reddit = praw.Reddit(
            client_id=REDDIT_CLIENT_ID,
            client_secret=REDDIT_CLIENT_SECRET,
            user_agent=REDDIT_USER_AGENT
        )
        logger.info(f"✅ Authenticated as Reddit app (Read Only: {reddit.read_only})")
    except Exception as e:
        logger.error(f"❌ Reddit API Error: {e}")
        logger.error("Did you paste your Client ID and Secret at the top of the file?")
        return

    logger.info(f"🛰️ Subscribed to live feeds from r/{TARGET_SUBREDDITS}")
    logger.info("Initializing live stream (batch interval: 40-80 seconds)...")

    # Keep track of seen IDs to avoid duplicates
    seen_ids = set()

    while True:
        try:
            logger.info("Fetching latest massive batch from Reddit...")
            subreddit = reddit.subreddit(TARGET_SUBREDDITS)
            
            # Pull up to 100 recent posts
            batch_count = 0
            for submission in subreddit.new(limit=100):
                if submission.id not in seen_ids:
                    seen_ids.add(submission.id)
                    
                    # Merge Title and Body text
                    full_text = f"{submission.title}. {submission.selftext}"
                    
                    # Only ingest if it looks like a municipal grievance
                    if is_grievance(full_text):
                        payload = {
                            "complaint_id": f"RD-{submission.id}",
                            "source": f"Reddit (r/{submission.subreddit.display_name})",
                            "citizen_name": "Anonymous Citizen",
                            "language": "en",
                            "original_text": str(full_text)[:1000],  # type: ignore
                            "translated_text": str(full_text)[:1000], # type: ignore
                            "ward": str(submission.subreddit.display_name).capitalize(),
                            "location": "India", # Needs to be NLP-extracted in backend!
                            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        }
                        
                        producer.send(topic, value=payload)
                        batch_count = batch_count + 1  # type: ignore
            
            producer.flush()
            logger.info(f"🚀 Pushed {batch_count} new real-world grievances to Kafka!")
            
            # Wait for 40 to 80 seconds as requested!
            sleep_time = random.uniform(40, 80)
            logger.info(f"💤 Sleeping for {int(sleep_time)} seconds until next massive pull...\n")
            time.sleep(sleep_time)
            
        except Exception as e:
            logger.warning(f"⚠️ Network/Rate limit error: {e}. Retrying in 30 seconds...")
            time.sleep(30)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Live Reddit CivicPulse Producer")
    parser.add_argument('--topic', type=str, default='citizen_complaints_raw', help='Kafka topic')
    parser.add_argument('--servers', type=str, default='localhost:9092', help='Kafka servers')
    args = parser.parse_args()
    
    stream_reddit_data(args.servers, args.topic)
