"""
Models Manager - Representa um Gestor (que também é um Employee)
"""
import uuid
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
# Importar Employee aqui para referência explícita no foreign_keys
from app.models.employee import Employee

class Manager(Base):
    __tablename__ = "managers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Relação 1: Um Manager É um Employee (one-to-one)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), unique=True, nullable=False)
    employee = relationship("Employee", back_populates="manager_profile") # Ligação para o perfil de funcionário DESTE gerente

    # Relação 2: Um Manager Gerencia vários Employees (one-to-many)
    # MUDANÇA: Especificar 'foreign_keys' para dizer qual coluna usar na tabela Employee
    #          para encontrar os funcionários gerenciados POR ESTE gerente.
    employees = relationship(
        "Employee",
        back_populates="manager",
        foreign_keys=[Employee.manager_id] # Usar a coluna manager_id da tabela Employee
    )
