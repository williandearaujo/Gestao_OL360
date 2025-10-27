"""
Models Employee - Representa um Colaborador
"""
import uuid
from sqlalchemy import (
    Column, String, Date, ForeignKey, Text, Boolean, Integer, DateTime
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.team import Team
    from app.models.manager import Manager
    from app.models.user import User
    from app.models.employee_knowledge import EmployeeKnowledge
    from app.models.day_off import EmployeeDayOff
    from app.models.one_on_one import EmployeeOneOnOne
    from app.models.pdi_log import EmployeePdiLog

class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome_completo = Column(String(100), nullable=False)
    email_pessoal = Column(String(100), unique=True)
    email_corporativo = Column(String(100), unique=True, nullable=False)
    telefone_pessoal = Column(String(20))
    telefone_corporativo = Column(String(20))
    data_nascimento = Column(Date)
    cpf = Column(String(14), unique=True)
    rg = Column(String(20))
    endereco_completo = Column(Text)
    contato_emergencia_nome = Column(String(100))
    contato_emergencia_telefone = Column(String(20))
    data_admissao = Column(Date, nullable=False)
    cargo = Column(String(100))
    senioridade = Column(String(50)) # Ex: Trainee, Junior, Pleno, Senior, Especialista
    status = Column(String(20), default="ATIVO") # ATIVO, INATIVO, FERIAS, DAYOFF

    # Campos para PDI e 1x1 simplificados (conforme PRD)
    data_proximo_pdi = Column(Date, nullable=True)
    data_proxima_1x1 = Column(Date, nullable=True)
    data_ultima_1x1 = Column(Date, nullable=True)
    data_ultimo_pdi = Column(Date, nullable=True)

    # Campo para Férias (conforme PRD e correção anterior)
    ferias_dados = Column(JSONB, nullable=True, default=lambda: {"periodos": [], "dias_disponiveis": 0})

    # Chaves Estrangeiras e Relacionamentos
    area_id = Column(UUID(as_uuid=True), ForeignKey("areas.id"), nullable=True)
    area = relationship("Area", back_populates="employees")

    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True)
    # MUDANÇA: Especificar 'foreign_keys' para dizer qual coluna usar nesta tabela (Employee)
    #          para encontrar o time ao qual ESTE funcionário pertence.
    team = relationship(
        "Team",
        back_populates="employees",
        foreign_keys=[team_id] # Usar a coluna team_id desta tabela (Employee)
    )

    manager_id = Column(UUID(as_uuid=True), ForeignKey("managers.id"), nullable=True) # ID do Manager que gerencia este Employee
    manager = relationship("Manager", back_populates="employees", foreign_keys=[manager_id]) # Ligação para o gestor

    # Relacionamento reverso para Manager (quando este Employee é um Manager)
    manager_profile = relationship(
        "Manager",
        back_populates="employee",
        uselist=False,
        cascade="all, delete-orphan",
        foreign_keys="Manager.employee_id"
    )

    # Relacionamento com User
    user = relationship("User", back_populates="employee", uselist=False, cascade="all, delete-orphan")

    # Relacionamento com EmployeeKnowledge
    knowledges = relationship("EmployeeKnowledge", back_populates="employee", cascade="all, delete-orphan")
    day_offs = relationship("EmployeeDayOff", back_populates="employee", cascade="all, delete-orphan")
    one_on_ones = relationship("EmployeeOneOnOne", back_populates="employee", cascade="all, delete-orphan")
    pdi_logs = relationship("EmployeePdiLog", back_populates="employee", cascade="all, delete-orphan")

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
