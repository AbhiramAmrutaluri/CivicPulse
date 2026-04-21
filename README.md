# CivicPulse AI

CivicPulse AI is an end-to-end civic grievance intelligence platform that combines streaming ingestion, real-time dashboards, geospatial hotspot mapping, and API-driven workflows for municipal response teams.

It is built as a full-stack system:
- React + Vite frontend for operations dashboards
- FastAPI backend for data services and live WebSocket broadcasting
- PostgreSQL for complaint, cluster, and SLA data
- Kafka + Zookeeper for live data ingestion and routing
- Python streaming utilities for producer/consumer simulation

## What You Get

- Real-time complaint event streaming to the dashboard via WebSocket
- AI pulse-map style hotspot visibility for rapid dispatch decisions
- Complaint lifecycle APIs (create, read, status update)
- Aggregation APIs for category/ward/urgency/SLA views
- Kafka validation + dead-letter queue handling
- Local-first setup that works with Docker-backed Kafka and native Postgres

## Architecture

1. Data producer publishes complaint events to Kafka topic `citizen_complaints_raw`.
2. Streaming consumer validates records and routes:
- Valid events -> `citizen_complaints_validated`
- Invalid events -> `citizen_complaints_dlq`
3. Valid events are also pushed to backend endpoint `/ws/trigger-event`.
4. Backend broadcasts events to connected frontend clients on WebSocket `/ws/dashboard`.
5. Frontend updates live feed and metrics in near real-time.

## Tech Stack

- Frontend: React 19, Vite 8, React Router, React Query, Recharts, Leaflet
- Backend: FastAPI, SQLAlchemy, Uvicorn, Pydantic
- Streaming: kafka-python, requests
- Data/ML utilities: pandas, numpy, scikit-learn, pyspark
- Database: PostgreSQL
- Infra: Docker Compose (Kafka + Zookeeper)

## Repository Layout

```
backend/            FastAPI app, routers, ORM models, database session setup
frontend/           React dashboard application (Vite)
streaming/          Kafka consumer, preprocessing and clustering utilities
data-simulator/     Kafka producer, CSV data generation/simulation scripts
database/           SQL schema and seed scripts
nlp/                NLP and model-related scripts
docker-compose.yml  Kafka + Zookeeper services
start.bat           One-click local startup helper (Windows)
```

## Prerequisites

- Python 3.10+
- Node.js 20+
- npm 10+
- Docker Desktop (for Kafka + Zookeeper)
- PostgreSQL (running locally)

## Environment Configuration

### Backend

Backend reads `DATABASE_URL` from environment. If missing, it defaults to:

`postgresql://postgres:%40Abhiram_006@localhost:5432/civicpulse`

Set your own value before running in team/shared environments.

PowerShell example:

```powershell
$env:DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/civicpulse"
```

### Frontend

Frontend reads `VITE_API_URL` and defaults to `http://localhost:8000`.

Create `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:8000
```

## Installation

### 1. Clone and enter project

```powershell
git clone <your-repo-url>
cd "CivicPulse AI"
```

### 2. Python dependencies (root)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Frontend dependencies

```powershell
cd frontend
npm install
cd ..
```

### 4. Optional simulator-only dependencies

```powershell
pip install -r data-simulator/requirements.txt
```

### 5. Database initialization

Create database `civicpulse`, then execute:

```powershell
psql -U postgres -d civicpulse -f database/schema.sql
psql -U postgres -d civicpulse -f database/seed.sql
```

## Running the Platform

### Option A: One-click startup (Windows)

```powershell
start.bat
```

This starts:
- Kafka + Zookeeper (Docker)
- Backend API on port 8000
- Frontend dev server (Vite default: 5173)
- Streaming consumer
- Data simulator producer

### Option B: Manual startup (recommended for debugging)

1. Kafka + Zookeeper

```powershell
docker-compose up -d
```

2. Backend

```powershell
cd backend
..\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. Frontend

```powershell
cd frontend
npm run dev
```

4. Consumer

```powershell
cd streaming
..\venv\Scripts\python.exe consumer.py --servers localhost:9092
```

5. Producer

```powershell
cd data-simulator
..\venv\Scripts\python.exe producer.py --servers localhost:9092
```

## Access Points

- Backend API docs: `http://localhost:8000/docs`
- Backend root health route: `http://localhost:8000/`
- Frontend dashboard: Vite local URL (commonly `http://localhost:5173`)
- Live WebSocket endpoint: `ws://localhost:8000/ws/dashboard`

## API Endpoints (Core)

### Health / Base

- `GET /` -> service health payload
- `GET /clusters?limit=50` -> hotspot clusters
- `GET /departments` -> department list

### Complaints

- `POST /complaints/` -> create complaint
- `GET /complaints/?skip=0&limit=200` -> list complaints
- `GET /complaints/feed/live` -> latest live feed subset
- `GET /complaints/{complaint_id}` -> get one complaint
- `PATCH /complaints/{complaint_id}/status` -> update complaint status

### Analytics

- `GET /analytics/overview`
- `GET /analytics/category-wise`
- `GET /analytics/ward-wise`
- `GET /analytics/urgency-wise`
- `GET /analytics/sla`

### Live Streaming

- `WS /ws/dashboard` -> dashboard live stream
- `POST /ws/trigger-event` -> broadcast event to connected clients

## Streaming Topics

- `citizen_complaints_raw` (incoming)
- `citizen_complaints_validated` (clean records)
- `citizen_complaints_dlq` (invalid records)

## Useful Commands

### Run producer with custom file/delay

```powershell
cd data-simulator
python producer.py --file civicpulse_sample.csv --topic citizen_complaints_raw --servers localhost:9092 --delay 0.5
```

### Run consumer with explicit topics

```powershell
cd streaming
python consumer.py --servers localhost:9092 --in-topic citizen_complaints_raw --valid-topic citizen_complaints_validated --dlq-topic citizen_complaints_dlq
```

### Trigger one live event manually

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/ws/trigger-event -ContentType "application/json" -Body '{"event_type":"NEW_COMPLAINT","payload":{"id":"TEST1234","citizen_name":"Demo Citizen","location":"Ward 1","category":"Roads","urgency":"High","created_at":"2026-04-21T10:00:00Z"}}'
```

## Troubleshooting

### Backend cannot connect to database

- Check `DATABASE_URL` format and credentials
- Verify PostgreSQL service is running
- Ensure `civicpulse` DB exists and schema is applied

### Kafka connection issues

- Ensure Docker Desktop is running
- Run `docker-compose ps` and confirm Kafka/Zookeeper are healthy
- Verify `localhost:9092` is reachable

### Frontend shows stale/no live data

- Confirm consumer process is running
- Confirm backend is up and `/ws/dashboard` is reachable
- Check browser console for WebSocket reconnect logs

### Consumer broadcasts failing

- Confirm backend route `http://localhost:8000/ws/trigger-event` is available
- Check firewall/network restrictions on localhost ports

## Validation and Test References

Project includes additional implementation and testing guides:

- `LIVE_STREAMING_README.md`
- `LIVE_STREAMING_TEST_GUIDE.md`
- `TEST_LIVE_DASHBOARD.ps1`
- `PULSE_MAP_QUICK_START.md`
- `PULSE_MAP_FEATURES.md`

## Current Status

- Live dashboard streaming integrated
- Pulse map capability documented and available in frontend
- Modular backend routers for complaints, analytics, and live channel
- Kafka-based ingestion pipeline with validation and DLQ routing

## License

Add your license of choice (MIT/Apache-2.0/proprietary) in this repository.

## Contributors

- Abhiram Amrutaluri
- P N Vedha Sree