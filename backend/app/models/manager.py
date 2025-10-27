"""
Models Manager - Gestores
"""
import uuid
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

class Manager(Base):
    __tablename__ = "managers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Relacionamento 1:1 com Employee
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), unique=True, nullable=False)
    
    # Nível de gestão (ex: 1-Diretor, 2-Gerente, 3-Coordenador)
    management_level = Column(Integer, nullable=True) 
    
    # Relacionamentos
    # Um gerente é um funcionário
    employee = relationship("Employee", back_populates="manager_profile", uselist=False)
    
    # Um gerente pode gerenciar múltiplos funcionários (se for o manager_id deles)
    employees_managed = relationship("Employee", back_populates="manager", foreign_keys="[Employee.manager_id]")

  