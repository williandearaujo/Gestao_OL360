"""
Model EmployeeOneOnOne - Histórico de reuniões 1x1 dos colaboradores
"""
import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class EmployeeOneOnOne(Base):
    __tablename__ = "employee_one_on_ones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)
    data_agendada = Column(Date, nullable=False)
    data_realizada = Column(Date, nullable=True)
    status = Column(String(20), nullable=False, default="AGENDADO")
    notas = Column(Text, nullable=True)
    pdi_alinhado = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="one_on_ones")
