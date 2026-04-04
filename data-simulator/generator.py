import csv
import json
import random
import uuid
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any

try:
    from faker import Faker # type: ignore
except ImportError:
    print("Please install faker: pip install faker")
    sys.exit(1)

try:
    from groq import Groq # type: ignore
except ImportError:
    print("Please install groq: pip install groq")
    sys.exit(1)

# Load Groq API key from environment only
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("GROQ_API_KEY is not set. Export it before running generator.py")
    sys.exit(1)

client = Groq(api_key=groq_api_key)

fake = Faker('en_IN')

# Configuration
NUM_RECORDS = 300
OUTPUT_FILE = 'civicpulse_sample.csv'

CATEGORIES: List[str] = [
    'sanitation', 'drainage', 'roads', 'water_supply', 
    'street_lights', 'public_health', 'electricity'
]

DEPARTMENTS: Dict[str, str] = {
    'sanitation': 'Solid Waste Management',
    'drainage': 'Sewerage Department',
    'roads': 'Public Works Department',
    'water_supply': 'Water Board',
    'street_lights': 'Electrical Department',
    'public_health': 'Health Department',
    'electricity': 'Power Distribution Company'
}

SOURCES: List[str] = ['App', 'Web', 'WhatsApp', 'Twitter', 'CallCenter']
WARDS: List[str] = [
    'Ward 1 - Kapra', 'Ward 2 - AS Rao Nagar', 'Ward 3 - Malkajgiri', 
    'Ward 6 - Jubilee Hills', 'Ward 7 - Banjara Hills', 'Ward 8 - Khairatabad',
    'Ward 10 - Charminar', 'Ward 14 - L.B. Nagar', 'Ward 15 - Kukatpally'
]

def determine_urgency(category: str, text_en: str) -> str:
    critical_keywords = ['dangerous', 'live wire', 'accident', 'open manhole', 'child fell', 'fire', 'sparking', 'crater', 'emergency']
    high_keywords = ['no drinking water', 'overflowing', 'dead animal', '3 days', 'urgent', 'immediately']
    
    text_lower = text_en.lower()
    
    if any(kw in text_lower for kw in critical_keywords): return 'Critical'
    if any(kw in text_lower for kw in high_keywords): return 'High'
    if category in ['water_supply', 'electricity', 'public_health']:
        return str(random.choice(['Medium', 'High']))
    return str(random.choice(['Low', 'Medium']))

def generate_groq_batch(batch_size: int) -> List[Dict[str, Any]]:
    prompt = f"""
    Generate a JSON object containing a key 'complaints' mapped to an array of {batch_size} unique, hyper-realistic Indian municipal complaints.
    Categories to strictly use: sanitation, drainage, roads, water_supply, street_lights, public_health, electricity.
    Languages to distribute strictly as: 50% "EN" (English), 25% "HI" (Hindi), 25% "TE" (Telugu). If HI or TE, write the original_text natively!
    
    JSON Schema per item:
    {{
        "category": "string (must match above list exactly)",
        "language": "EN" | "HI" | "TE",
        "original_text": "string (the actual angry/frustrated citizen message)",
        "translated_text": "string (accurate english translation of original_text)"
    }}
    
    Make them sound like real frustrated citizens on Twitter or WhatsApp. Include slang, minor typos, or high emotion occasionally.
    Make the complaints diverse (from minor inconveniences to severe municipal failures).
    Output ONLY valid JSON and absolutely nothing else.
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Using the newest supported Llama model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        if content:
            parsed = json.loads(content)
            if isinstance(parsed, dict):
                complaints = parsed.get('complaints', [])
                if isinstance(complaints, list):
                    return complaints
        return []
    except Exception as e:
        print(f"Error calling Groq: {e}")
        return []

def get_all_groq_complaints(total_needed: int) -> List[Dict[str, Any]]:
    print(f"Calling Groq LPU to physically generate {total_needed} hyper-realistic unique complaints...")
    all_complaints: List[Dict[str, Any]] = []
    
    # Batch heavily to avoid context limits
    batches = total_needed // 50
    remainder = total_needed % 50
    batch_sizes = [50] * batches + ([remainder] if remainder > 0 else [])
    
    for idx, b_size in enumerate(batch_sizes):
        print(f"   -> Generating batch {idx+1}/{len(batch_sizes)} ({b_size} records)...")
        data = generate_groq_batch(b_size)
        all_complaints.extend(data)
        
    return all_complaints

def generate_dataset(num_records: int = 300, output_csv: str = 'civicpulse_sample.csv') -> None:
    
    # 1. Fetch raw NLP templates dynamically from Groq Llama3
    groq_pool = get_all_groq_complaints(num_records)
    
    # 2. Establish Geo-Spatial DBSCAN Hotspots for Phase 7
    hotspots: List[Dict[str, Any]] = []
    for _ in range(15):  # 15 distinct cluster centers across the city
        ward = str(random.choice(WARDS))
        lat = float(f"{random.uniform(17.3, 17.5):.6f}") # Hyderabad approx
        lon = float(f"{random.uniform(78.3, 78.5):.6f}")
        hotspots.append({'ward': ward, 'lat': lat, 'lon': lon})

    records: List[Dict[str, Any]] = []
    
    for i in range(min(num_records, len(groq_pool))):
        base_complaint = groq_pool[i]
        
        # Ensure category safety against LLM hallucinations
        raw_cat = base_complaint.get('category')
        category = str(raw_cat).lower() if isinstance(raw_cat, str) else str(random.choice(CATEGORIES))
        if category not in CATEGORIES: category = str(random.choice(CATEGORIES))
        
        # 30% chance to drop this specific complaint tightly inside a Hotspot coordinate range
        if random.random() < 0.3:
            hs = random.choice(hotspots)
            ward = str(hs['ward'])
            lat = float(hs['lat']) + float(random.uniform(-0.0005, 0.0005))
            lon = float(hs['lon']) + float(random.uniform(-0.0005, 0.0005))
        else:
            ward = str(random.choice(WARDS))
            lat = float(f"{random.uniform(17.3, 17.5):.6f}")
            lon = float(f"{random.uniform(78.3, 78.5):.6f}")
            
        raw_lang = base_complaint.get('language')
        language = str(raw_lang) if isinstance(raw_lang, str) else 'EN'
        
        raw_orig = base_complaint.get('original_text')
        original_text = str(raw_orig) if isinstance(raw_orig, str) else 'Complaint registered.'
        
        raw_trans = base_complaint.get('translated_text')
        translated_text = str(raw_trans) if isinstance(raw_trans, str) else 'Complaint registered.'
            
        urgency = determine_urgency(category, translated_text)
        
        # Setup historically distributed SLAs
        created_at_dt = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        days_old = (datetime.now() - created_at_dt).days
        
        status = 'Pending'
        if days_old > 20: 
            status = str(random.choices(['Resolved', 'Closed'], weights=[0.2, 0.8])[0])
        elif days_old > 7: 
            status = str(random.choices(['Pending', 'In Progress', 'Resolved'], weights=[0.2, 0.4, 0.4])[0])
        else: 
            status = str(random.choices(['Pending', 'In Progress'], weights=[0.7, 0.3])[0])

        record: Dict[str, Any] = {
            'complaint_id': str(uuid.uuid4()),
            'source': str(random.choice(SOURCES)),
            'citizen_name': str(fake.name()),
            'language': language,
            'original_text': original_text,
            'translated_text': translated_text,
            'ward': ward,
            'location': f"{lat}, {lon}",
            'created_at': created_at_dt.strftime("%Y-%m-%d %H:%M:%S"),
            'category': category,
            'urgency': urgency,
            'department': DEPARTMENTS.get(category, 'General Administration'),
            'status': status
        }
        records.append(record)
        
    records.sort(key=lambda x: str(x['created_at']), reverse=True)
    
    fieldnames = ['complaint_id', 'source', 'citizen_name', 'language', 'original_text', 
                  'translated_text', 'ward', 'location', 'created_at', 'category', 
                  'urgency', 'department', 'status']
                  
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
        
    print(f"\nGENERATION COMPLETE: {len(records)} Groq-powered records written cleanly to {output_csv}")
    
    # Save isolated sample specifically for Kafka pipeline checks
    with open('sample_kafka_payload.json', 'w', encoding='utf-8') as f:
        sample_records = [records[i] for i in range(min(2, len(records)))]
        json.dump(sample_records, f, indent=4, ensure_ascii=False)
    print("Created sample_kafka_payload.json for immediate producer testing.")

if __name__ == '__main__':
    generate_dataset(NUM_RECORDS, OUTPUT_FILE)
