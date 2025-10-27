from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Enum as SqlEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.models.base import Base  # ajuste para caminho correto do seu projeto
from sqlalchemy.sql import func

class AlertTypeEnum(str, enum.Enum):
    CERTIFICATION_EXPIRING = "certification_expiring"
    CERTIFICATION_EXPIRED = "certification_expired"
    VACATION_PENDING = "vacation_pending"
    BIRTHDAY = "birthday"
    PDI_DEADLINE = "pdi_deadline"
    ONE_ON_ONE_SCHEDULED = "one_on_one_scheduled"
    DOCUMENT_MISSING = "document_missing"
    SYSTEM = "system"

class AlertPriorityEnum(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(SqlEnum(AlertTypeEnum), nullable=False)
    priority = Column(SqlEnum(AlertPriorityEnum), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    employee_name = Column(String, nullable=True)
    related_id = Column(Integer, nullable=True)
    related_type = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime, nullable=True)
    action_url = Column(String, nullable=True)
    meta_data = Column(JSON, nullable=True)

