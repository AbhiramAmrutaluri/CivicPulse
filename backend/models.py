from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(100), nullable=False)
    citizen_name = Column(String(100))
    complaint_text = Column(String, nullable=False)
    category = Column(String(50))
    urgency = Column(String(20))
    status = Column(String(50), default='Pending')
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    ward_name = Column(String(100))
    department_id = Column(UUID(as_uuid=True), ForeignKey('departments.id'))
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('complaint_clusters.id'))
    
    # SLA Fields from Phase 11
    department = Column(String(100))
    deadline_timestamp = Column(DateTime)
    is_overdue = Column(String(10)) # Using string true/false for hackathon simplicity

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime(timezone=True))

class ComplaintCluster(Base):
    __tablename__ = "complaint_clusters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String(50), nullable=False)
    ward_name = Column(String(100))
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    severity_score = Column(Integer, default=1)
    status = Column(String(50), default='Active')
    representative_text = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    target_sla_hours = Column(Integer, default=48)
