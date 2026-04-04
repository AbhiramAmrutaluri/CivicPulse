# CivicPulse AI: Sample Dataset Guide

This guide explains the data generation logic and how to integrate the dataset into your data pipeline.

## 1. Sample CSV Rows

Here are a few rows representing the generated `civicpulse_sample.csv`:

| complaint_id | source | citizen_name | language | original_text | translated_text | ward | location | created_at | category | urgency | department | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 5b6c7... | App | Ankit Sharma | EN | Overflowing garbage bin on main road | Overflowing garbage bin on main road | Ward 10 - Charminar | 17.345, 78.411 | 2026-03-24 10:15:00 | sanitation | High | Solid Waste Management | Pending |
| 1a2b3... | WhatsApp | Priya Reddy | TE | వీధిలో పడిన కరెంట్ తీగ! | Live wire fallen on the street! | Ward 6 - Jubilee Hills | 17.421, 78.399 | 2026-03-23 14:20:00 | electricity | Critical | Power Distribution Company | In Progress |
| 9f8e7... | Web | Rajesh Kumar | HI | 3 दिन से कचरा नहीं उठाया गया | Garbage not collected for 3 days | Ward 1 - Kapra | 17.488, 78.567 | 2026-03-15 09:30:00 | sanitation | Medium | Solid Waste Management | Resolved |

## 2. Logic Used for Duplicates & Urgency

### Duplicates & Clustering Candidates
- **Hotspots:** During generation, we pick 15 specific "hotspot" cases (e.g., a specific drain issue in Ward 3).
- **Probability:** There is a 30% chance any new complaint is drawn from these hotspots.
- **Near-Duplicates:** When drawn from a hotspot, there is a 50% chance the text is identical, and a 50% chance we add variations (e.g., "Please fix:", trailing punctuation, capitalization changes). We also introduce minimal noise to the lat/lon (±0.0005 degrees). This creates perfect material for the PySpark/NLP clustering logic.

### Urgency Scoring
Urgency is derived dynamically based on category and English keywords (`translated_text`):
- **Critical:** Triggered by severe safety keywords like `dangerous`, `live wire`, `accident`, `open manhole`.
- **High:** Triggered by severe inconvenience keywords like `no drinking water`, `overflowing`, `dead animal`.
- **Medium/Low:** Default fallback based on the category (e.g., street light outages usually default to Low/Medium unless safety is mentioned).

## 3. Importing into PostgreSQL Database

Although the main pipeline involves Kafka -> Spark/NLP -> Postgres, you can seed the database directly for testing the frontend dashboard.
Keep in mind your `complaints` table expects a slightly different schema (e.g., it has `user_id`, uses `lat`/`lon` instead of a combined string, and expects `department_id` UUIDs).

To bulk-import raw data to a compatible test table:

1. Create a staging table matching the CSV:
```sql
CREATE TABLE complaints_staging (
    complaint_id UUID, source TEXT, citizen_name TEXT, 
    language TEXT, original_text TEXT, translated_text TEXT, 
    ward TEXT, location TEXT, created_at TIMESTAMP, 
    category TEXT, urgency TEXT, department TEXT, status TEXT
);
```
2. Import the data using `psql`:
```bash
\copy complaints_staging FROM 'civicpulse_sample.csv' DELIMITER ',' CSV HEADER;
```
3. Insert into the main `complaints` table (matching the schema):
```sql
INSERT INTO complaints (id, user_id, citizen_name, complaint_text, category, urgency, status, lat, lon, ward_name, created_at)
SELECT 
    complaint_id, 
    'user_' || substring(complaint_id::text, 1, 8), -- Mock user_id 
    citizen_name, 
    translated_text, 
    category, 
    urgency, 
    status, 
    CAST(split_part(location, ',', 1) AS DOUBLE PRECISION), 
    CAST(split_part(location, ',', 2) AS DOUBLE PRECISION), 
    ward, 
    created_at
FROM complaints_staging;
```

## 4. Usage in Kafka Producer & NLP Pipeline

### Kafka Producer
Instead of reading the massive dataset all at once, your Kafka producer should read the CSV row by row and emit JSON events into the ingestion topic. The script automatically generates a `sample_kafka_payload.json` which shows exactly what a single JSON event looks like.

**Kafka Producer Example snippet (Python):**
```python
import csv
import json
from kafka import KafkaProducer
import time

producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

with open('civicpulse_sample.csv', mode='r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Publish to the 'civicpulse-ingestion' topic
        producer.send('civicpulse-ingestion', row)
        time.sleep(0.5) # Simulate streaming delay
```

### NLP Pipeline (PySpark/FastAPI)
In your streaming consumer processing loop:
1. **Language Detection & Translation:** Use the `language` and `original_text` fields to test your Azure/OpenAI translation API. Because we included `translated_text` as the ground-truth, you can evaluate your translation accuracy.
2. **Text Classification:** Run models over the `translated_text` and compare your model's inferred category against the CSV's `category`.
3. **Clustering:** Because of the hotspot duplicates we generated (same category/ward with near-identical text and close GPS coords), you can run TF-IDF + DBSCAN (or sentence embeddings) and verify that the duplicate records successfully map to the same `cluster_id`!
