"""
Model EmployeeDayOff - Histórico de Day Off dos colaboradores
"""
import uuid
from datetime import date

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class EmployeeDayOff(Base):
    __tablename__ = "employee_day_offs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)
    data = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="AGENDADO")
    motivo = Column(String(150), nullable=True)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="day_offs")

    def is_in_birthday_month(self, birth_date: date | None) -> bool:
        if not birth_date:
            return True
        return birth_date.month == self.data.month
