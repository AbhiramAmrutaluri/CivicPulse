import csv
import json
import time
import requests  # type: ignore
import random
import argparse
from datetime import datetime

API_URL = "http://localhost:8000/ws/trigger-event"

def run_simulator(csv_file: str, min_delay: float, max_delay: float):
    print(f"Starting Live Dashboard Simulator...")
    print(f"Reading from: {csv_file}")
    print(f"Target API: {API_URL}")
    print(f"Delay Range: {min_delay}s to {max_delay}s\n")
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = list(csv.DictReader(f))
            # Reverse it to pretend we're getting fresh ones
            reader.reverse()
            
            for index, row in enumerate(reader):
                raw_id = str(row.get('complaint_id', ''))
                complaint_id = raw_id[:8]  # type: ignore
                urgency = str(row.get('urgency', ''))
                
                payload = {
                    "event_type": "NEW_COMPLAINT",
                    "payload": {
                        "id": complaint_id,
                        "citizen_name": row.get('citizen_name'),
                        "language": row.get('language'),
                        "original_text": row.get('original_text'),
                        "translated_text": row.get('translated_text'),
                        "ward": row.get('ward'),
                        "location": row.get('location'),
                        "category": str(row.get('category', '')).capitalize(),
                        "urgency": urgency,
                        "department": row.get('department'),
                        "status": "Pending",
                        "created_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
                    }
                }
                
                try:
                    res = requests.post(API_URL, json=payload, timeout=2)
                    if res.status_code == 200:
                        data = res.json()
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] Broadcasted Complaint {complaint_id} | Urgency: {urgency} | Clients Reached: {data.get('connected_clients_reached', 0)}")
                    else:
                        print(f"Failed to broadcast (Status {res.status_code}): {res.text}")
                except requests.exceptions.ConnectionError:
                    print(f"CONNECTION ERROR: FastAPI Backend is not running at {API_URL}")
                
                # Sleep between events
                sleep_time = random.uniform(min_delay, max_delay)
                time.sleep(sleep_time)
                
    except FileNotFoundError:
        print(f"Error: {csv_file} not found. Please run generator.py first.")
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", default="civicpulse_sample.csv", help="Path to CSV")
    parser.add_argument("--min", type=float, default=40.0, help="Minimum seconds between events")
    parser.add_argument("--max", type=float, default=60.0, help="Maximum seconds between events")
    args = parser.parse_args()
    
    run_simulator(args.file, args.min, args.max)
