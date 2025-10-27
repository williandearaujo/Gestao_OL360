"""
Model EmployeePdiLog - Histórico de PDI dos colaboradores
"""
import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class EmployeePdiLog(Base):
    __tablename__ = "employee_pdi_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)
    titulo = Column(String(120), nullable=False)
    descricao = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="EM_ANDAMENTO")
    data_planejada = Column(Date, nullable=False)
    data_realizada = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="pdi_logs")
