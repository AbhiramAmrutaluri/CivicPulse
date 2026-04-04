from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, schemas
from database import get_db

router = APIRouter(prefix="/complaints", tags=["Complaints Master Control"])

@router.post("/", response_model=schemas.ComplaintResponse)
def create_complaint(complaint: schemas.ComplaintCreate, db: Session = Depends(get_db)):
    """Ingest a new manual complaint physically from the API."""
    return crud.create_complaint(db=db, complaint=complaint)

@router.get("/", response_model=List[schemas.ComplaintResponse])
def read_complaints(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    """Fetch the historic feed of complaints."""
    return crud.get_complaints(db, skip=skip, limit=limit)

@router.get("/feed/live")
def get_live_feed(db: Session = Depends(get_db)):
    """High-performance route dedicated specifically for React Ticker UI widgets."""
    return crud.get_complaints(db, skip=0, limit=10)

@router.get("/{complaint_id}", response_model=schemas.ComplaintResponse)
def read_complaint(complaint_id: str, db: Session = Depends(get_db)):
    db_complaint = crud.get_complaint(db, complaint_id=complaint_id)
    if db_complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not vertically found.")
    return db_complaint

@router.patch("/{complaint_id}/status", response_model=schemas.ComplaintResponse)
def update_status(complaint_id: str, status_update: schemas.ComplaintStatusUpdate, db: Session = Depends(get_db)):
    """Quickly flip a ticket from 'Pending' to 'In Progress'."""
    updated = crud.update_complaint_status(db, complaint_id, status_update.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Target Complaint not found in datastore.")
    return updated
