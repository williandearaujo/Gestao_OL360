"""
Model EmployeeSalaryHistory - Histórico salarial dos colaboradores.
"""
import uuid
from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class EmployeeSalaryHistory(Base):
    __tablename__ = "employee_salary_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    effective_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    employee = relationship("Employee", back_populates="salary_history")
    created_by_user = relationship("User", lazy="joined", foreign_keys=[created_by])

