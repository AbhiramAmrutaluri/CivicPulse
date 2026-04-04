-- schema.sql
-- CivicPulse AI Database Schema
-- Run this heavily optimized schema in PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Table
-- Stores routing targets and their respective Service Level Agreements (SLA)
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    target_sla_hours INT NOT NULL DEFAULT 48, -- Standard expected turnaround time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complaint Clusters (Hotspots) Table
-- Built by the AI/PySpark to group duplicate citizen complaints into one actionable issue.
CREATE TABLE complaint_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    ward_name VARCHAR(100),
    center_lat DOUBLE PRECISION NOT NULL,
    center_lon DOUBLE PRECISION NOT NULL,
    severity_score INT DEFAULT 1,             -- Increments as more duplicates are found
    status VARCHAR(50) DEFAULT 'Active',      -- Active, Addressed, Resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Complaints Table
-- The main fact table storing all raw ingested complaints after NLP processing
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    citizen_name VARCHAR(100),
    complaint_text TEXT NOT NULL,
    category VARCHAR(50),                     -- e.g., 'Sanitation', 'Roads'
    urgency VARCHAR(20),                      -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(50) DEFAULT 'Pending',     -- 'Pending', 'In Progress', 'Resolved', 'Overdue'
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    ward_name VARCHAR(100),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    cluster_id UUID REFERENCES complaint_clusters(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE      -- Null until resolved
);

-- 4. SLA Tracking Logs
-- Stores history of state changes to analyze how quickly departments resolve things.
CREATE TABLE sla_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_breach BOOLEAN DEFAULT FALSE           -- Flagged if it crossed the department SLA
);

-- ==========================================
-- INDEXES (Crucial for Dashboard Performance)
-- ==========================================
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_complaints_cluster ON complaints(cluster_id);
CREATE INDEX idx_complaints_ward ON complaints(ward_name);
CREATE INDEX idx_complaints_created_at_desc ON complaints(created_at DESC);

-- Geospatial B-Tree Index (If PostGIS is not used, B-tree on lat/lon helps slightly,
-- though ideally we'd use GiST with PostGIS in production. For hackathons, this works.)
CREATE INDEX idx_complaints_lat_lon ON complaints(lat, lon);

-- ==========================================
-- OPTIONAL: Materialized View for Analytics
-- ==========================================
-- Instead of doing heavy aggregations on the fly, the dashboard can hit this view.
-- Refresh concurrently every 5 mins via a cron job or pg_cron.
CREATE MATERIALIZED VIEW mv_dashboard_ward_analytics AS
SELECT 
    ward_name,
    category,
    status,
    urgency,
    COUNT(*) as total_complaints,
    DATE(created_at) as complaint_date
FROM complaints
GROUP BY ward_name, category, status, urgency, DATE(created_at);

-- Index on the materialized view for instant queries
CREATE UNIQUE INDEX idx_mv_ward_analytics ON mv_dashboard_ward_analytics(ward_name, category, status, urgency, complaint_date);
