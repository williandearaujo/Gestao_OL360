"""
Models Employee - Colaboradores
"""
import uuid
from sqlalchemy import (
    Column, String, Date, ForeignKey, Integer,
    Enum as SQLEnum, Text, Numeric, DateTime
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class EmployeeStatus(str, enum.Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    FERIAS = "FERIAS"
    DAYOFF = "DAYOFF"
    DESLIGADO = "DESLIGADO"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Informações Básicas
    nome_completo = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    
    # Informações Pessoais
    cpf = Column(String(14), unique=True, nullable=True)
    rg = Column(String(20), nullable=True)
    data_nascimento = Column(Date, nullable=True)
    telefone = Column(String(20), nullable=True)
    telefone_pessoal = Column(String(20), nullable=True)
    email_pessoal = Column(String(100), nullable=True)
    endereco = Column(Text, nullable=True)
    contato_emergencia = Column(String(255), nullable=True)
    
    # Informações Profissionais
    cargo = Column(String(100), nullable=False)
    data_admissao = Column(Date, nullable=True)
    salario = Column(Numeric(10, 2), nullable=True)
    departamento = Column(String(100), nullable=True) # Pode ser substituído por Area
    senioridade = Column(String(50), nullable=True)
    status = Column(SQLEnum(EmployeeStatus), nullable=False, default=EmployeeStatus.ATIVO)

    # Chaves Estrangeiras
    area_id = Column(UUID(as_uuid=True), ForeignKey("areas.id"), nullable=True)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("managers.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=True)

    # Datas de Acompanhamento (Simplificado conforme PRD)
    data_proximo_pdi = Column(Date, nullable=True)
    data_ultima_1x1 = Column(Date, nullable=True)
    data_proxima_1x1 = Column(Date, nullable=True)

    # Dados de Férias (JSONB para flexibilidade, como no PRD)
    ferias_dados = Column(JSONB, nullable=True, 
                          default=lambda: {"periodos_agendados": [], "dias_disponiveis": 30, "vencimento_proximo_periodo": None})

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="employee", uselist=False)
    area = relationship("Area", back_populates="employees")
    team = relationship("Team", back_populates="employees")
    manager = relationship("Manager", back_populates="employees_managed", foreign_keys=[manager_id])
    
    # MUDANÇA: Removido o relacionamento abaixo, pois deletamos o app/models/pdi.py
    # pdi = relationship("PDI", back_populates="employee")
    
    # MUDANÇA: Removido o relacionamento abaixo, pois deletamos o app/models/one_to_one.py
    # one_to_one = relationship("OneToOne", back_populates="employee")

    # Relacionamento 1:1 reverso para Manager (se este funcionário for um gerente)
    manager_profile = relationship("Manager", back_populates="employee", uselist=False, foreign_keys="[Manager.employee_id]")

