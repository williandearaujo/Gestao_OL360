from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
from uuid import UUID

class AlertType(str, Enum):
    certification_expiring = "certification_expiring"
    certification_expired = "certification_expired"
    vacation_pending = "vacation_pending"
    birthday = "birthday"
    work_anniversary = "work_anniversary"
    pdi_deadline = "pdi_deadline"
    one_on_one_scheduled = "one_on_one_scheduled"
    document_missing = "document_missing"
    system = "system"

class AlertPriority(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    info = "info"

class AlertBase(BaseModel):
    type: AlertType
    priority: AlertPriority
    title: str
    message: str
    employee_id: Optional[UUID] = None
    employee_name: Optional[str] = None
    related_id: Optional[int] = None
    related_type: Optional[str] = None
    is_read: bool = False
    expires_at: Optional[datetime] = None
    action_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default=None, alias="meta_data")

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    is_read: Optional[bool] = None

class AlertResponse(AlertBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True