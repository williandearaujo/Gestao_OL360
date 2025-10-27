from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base

class EmployeeDayOff(Base):
    __tablename__ = "employee_day_offs"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="AGENDADO")  # e.g., AGENDADO, UTILIZADO, CANCELADO

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="day_offs")
