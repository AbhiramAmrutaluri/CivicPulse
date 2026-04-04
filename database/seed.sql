-- seed.sql
-- Seed data to quickly test the dashboard without waiting for Kafka

-- Clean up
TRUNCATE TABLE sla_logs, complaints, complaint_clusters, departments CASCADE;

-- 1. Departments
INSERT INTO departments (id, name, target_sla_hours) VALUES
('d1000000-0000-0000-0000-000000000000', 'Sanitation Department', 24),
('d2000000-0000-0000-0000-000000000000', 'Drainage Department', 12),
('d3000000-0000-0000-0000-000000000000', 'Roads Department', 72),
('d4000000-0000-0000-0000-000000000000', 'Electrical Department', 6),
('d5000000-0000-0000-0000-000000000000', 'Water Works Department', 24);

-- 2. Complaint Clusters (Scenario: A giant pothole grouping multiple complaints)
INSERT INTO complaint_clusters (id, category, ward_name, center_lat, center_lon, severity_score, status) VALUES
('c1000000-0000-0000-0000-000000000000', 'Roads', 'Downtown', 40.7125, -74.0055, 3, 'Active'),
('c2000000-0000-0000-0000-000000000000', 'Drainage', 'West End', 40.7300, -74.0200, 5, 'Active');

-- 3. Complaints
INSERT INTO complaints (id, user_id, citizen_name, complaint_text, category, urgency, status, lat, lon, ward_name, department_id, cluster_id, created_at) VALUES
-- Clustered Pothole Complaints (Roads)
('11111111-1111-1111-1111-111111111111', 'u1', 'Rohan S.', 'Huge pothole damaging cars.', 'Roads', 'High', 'Pending', 40.7128, -74.0060, 'Downtown', 'd3000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222222', 'u2', 'Priya M.', 'Another car stuck in the pothole here.', 'Roads', 'Critical', 'Pending', 40.7126, -74.0058, 'Downtown', 'd3000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', NOW() - INTERVAL '1 day'),
-- Resolved Issue
('33333333-3333-3333-3333-333333333333', 'u3', 'Amit K.', 'Streetlight revolves on/off.', 'Electrical', 'Medium', 'Resolved', 40.7500, -73.9800, 'North Sector', 'd4000000-0000-0000-0000-000000000000', NULL, NOW() - INTERVAL '4 days'),
-- Overdue Issue (SLA Breach)
('44444444-4444-4444-4444-444444444444', 'u4', 'Neha P.', 'Garbage not collected for a week.', 'Sanitation', 'High', 'Overdue', 40.7130, -74.0065, 'Downtown', 'd1000000-0000-0000-0000-000000000000', NULL, NOW() - INTERVAL '5 days');

-- 4. SLA Logs
INSERT INTO sla_logs (complaint_id, previous_status, new_status, is_breach, changed_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Assigned', 'Pending', FALSE, NOW() - INTERVAL '2 days'),
('33333333-3333-3333-3333-333333333333', 'Assigned', 'Resolved', FALSE, NOW() - INTERVAL '1 day'),
('44444444-4444-4444-4444-444444444444', 'Pending', 'Overdue', TRUE, NOW() - INTERVAL '1 day');

REFRESH MATERIALIZED VIEW mv_dashboard_ward_analytics;
