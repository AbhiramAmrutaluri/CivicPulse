from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
import uuid

# --- Complaints Request/Response Validation Schemas ---
class ComplaintBase(BaseModel):
    citizen_name: str
    complaint_text: str
    category: str
    urgency: str
    lat: float
    lon: float
    ward_name: str

class ComplaintCreate(ComplaintBase):
    user_id: str

class ComplaintResponse(ComplaintBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime
    deadline_timestamp: Optional[datetime] = None
    is_overdue: Optional[str] = None
    resolved_at: Optional[datetime] = None

class ComplaintStatusUpdate(BaseModel):
    status: str
