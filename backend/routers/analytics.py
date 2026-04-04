from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud
from database import get_db

router = APIRouter(prefix="/analytics", tags=["Dashboard Aggregation Engine"])

@router.get("/overview")
def get_overview(db: Session = Depends(get_db)):
    total = len(crud.get_complaints(db, limit=10000))
    hotspots = len(crud.get_clusters(db, limit=1000))
    resolved = len([c for c in crud.get_sla_analytics(db) if c[0] == 'Resolved' or c[0] == 'Closed'])
    
    return {
        "total_complaints": total, 
        "active_clusters": hotspots,
        "resolved_tickets": resolved,
        "health_score": "88%"
    }

@router.get("/category-wise")
def get_category_wise(db: Session = Depends(get_db)):
    data = crud.get_category_analytics(db)
    return [{"category": d[0], "count": d[1]} for d in data]

@router.get("/ward-wise")
def get_ward_wise(db: Session = Depends(get_db)):
    data = crud.get_ward_analytics(db)
    return [{"ward": d[0], "count": d[1]} for d in data]

@router.get("/urgency-wise")
def get_urgency_wise(db: Session = Depends(get_db)):
    data = crud.get_urgency_analytics(db)
    return [{"urgency": d[0], "count": d[1]} for d in data]

@router.get("/sla")
def get_sla(db: Session = Depends(get_db)):
    data = crud.get_sla_analytics(db)
    return [{"status": d[0], "count": d[1]} for d in data]
