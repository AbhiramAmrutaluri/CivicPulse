# Phase 4: Kafka Producer Integration

This document covers the details of setting up, running, and testing the `producer.py` ingestion script for CivicPulse AI.

## 1. Requirements

The necessary packages are already listed in your `requirements.txt`:
```text
kafka-python==2.0.2
```
Install them via:
```bash
pip install -r requirements.txt
```

## 2. Kafka Topic Naming Suggestion

The script targets **`citizen_complaints_raw`** by default. 
*Why?* It clearly identifies the domain (`citizen_complaints`), and the suffix `_raw` indicates that this is unprocessed data directly from the edge (before NLP deduplication, translation, or sentiment analysis). Later in the pipeline, PySpark might publish to a topic like `citizen_complaints_enriched`.

## 3. Local Kafka Setup Steps

For local development without Docker, use the following setup (assuming you have Java installed and Kafka downloaded):

1. **Start Zookeeper** (in terminal 1):
   ```bash
   bin/windows/zookeeper-server-start.bat config/zookeeper.properties
   ```
2. **Start Kafka Broker** (in terminal 2):
   ```bash
   bin/windows/kafka-server-start.bat config/server.properties
   ```
3. **Create the Topic** (in terminal 3):
   ```bash
   bin/windows/kafka-topics.bat --create --topic citizen_complaints_raw --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   ```
   *(We use 3 partitions to allow concurrent processing by your PySpark executors later).*

*(Alternatively, if you are using `docker-compose.yml`, run `docker-compose up -d kafka zookeeper`).*

## 4. How to Run the Producer

Run the script from your `data-simulator` directory. By default, it reads `civicpulse_sample.csv` and publishes 1 message per second.

```bash
python producer.py
```

## 5. Sample Output Logs

When running successfully, the producer will output robust, production-style logs:

```text
2026-03-24 18:30:10,123 - CivicPulseProducer - INFO - Connecting to Kafka at localhost:9092... (Attempt 1/5)
2026-03-24 18:30:10,145 - CivicPulseProducer - INFO - Successfully connected to Kafka brokers!
2026-03-24 18:30:10,146 - CivicPulseProducer - INFO - Starting raw complaint ingestion to topic: 'citizen_complaints_raw'
2026-03-24 18:30:20,201 - CivicPulseProducer - INFO - Published 10 complaints...
2026-03-24 18:30:30,254 - CivicPulseProducer - INFO - Published 20 complaints...
```

If Kafka is offline, the retry logic handles it gracefully:
```text
2026-03-24 18:30:10,123 - CivicPulseProducer - INFO - Connecting to Kafka at localhost:9092... (Attempt 1/5)
2026-03-24 18:30:10,145 - CivicPulseProducer - WARNING - Broker not available: NoBrokersAvailable. Retrying in 5 seconds...
```

## 6. How to Simulate High-Volume Complaint Bursts

To simulate a sudden spike in complaints (e.g., during a monsoon flood), you can override the default delay using command-line arguments. 

Setting `--delay 0` triggers "burst mode," which streams thousands of records instantly:

```bash
python producer.py --delay 0
```

You can also test a mild stream speed-up using something like `--delay 0.1` (10 messages a second).
