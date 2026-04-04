from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import models, schemas
from datetime import datetime

# ===========================
# Complaints Core Operations
# ===========================
def get_complaints(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves all complaints ordered precisely by creation date."""
    return db.query(models.Complaint).order_by(desc(models.Complaint.created_at)).offset(skip).limit(limit).all()

def get_complaint(db: Session, complaint_id: str):
    return db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()

def create_complaint(db: Session, complaint: schemas.ComplaintCreate):
    db_complaint = models.Complaint(**complaint.model_dump())
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

def update_complaint_status(db: Session, complaint_id: str, status: str):
    db_complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if db_complaint:
        db_complaint.status = status
        db_complaint.updated_at = datetime.utcnow()
        if status.lower() == 'resolved':
            db_complaint.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(db_complaint)
    return db_complaint

# ===========================
# Dashboard Aggregations
# Hackathon-scalable: Reuses live queries instead of hitting materialized views.
# ===========================
def get_category_analytics(db: Session):
    return db.query(
        models.Complaint.category, 
        func.count(models.Complaint.id).label('count')
    ).group_by(models.Complaint.category).all()

def get_urgency_analytics(db: Session):
    return db.query(
        models.Complaint.urgency, 
        func.count(models.Complaint.id).label('count')
    ).group_by(models.Complaint.urgency).all()

def get_ward_analytics(db: Session):
    return db.query(
        models.Complaint.ward_name, 
        func.count(models.Complaint.id).label('count')
    ).group_by(models.Complaint.ward_name).order_by(desc('count')).limit(10).all()

def get_sla_analytics(db: Session):
    return db.query(
        models.Complaint.status, 
        func.count(models.Complaint.id).label('count')
    ).group_by(models.Complaint.status).all()

# ===========================
# Clusters & Geography Operations
# ===========================
def get_clusters(db: Session, limit: int = 20):
    return db.query(models.ComplaintCluster).order_by(desc(models.ComplaintCluster.severity_score)).limit(limit).all()

def get_departments(db: Session):
    return db.query(models.Department).all()
