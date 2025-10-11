"""
Models SQLAlchemy - Employee e relacionados
"""

from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Numeric, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid
import enum

from app.database import Base
from app.models.user import UserRole


# ============================================================================
# ENUMS
# ============================================================================

class EmployeeStatus(str, enum.Enum):
    """Status do colaborador"""
    ATIVO = "ATIVO"
    FERIAS = "FERIAS"
    AFASTADO = "AFASTADO"
    DESLIGADO = "DESLIGADO"


class MaritalStatus(str, enum.Enum):
    """Estado civil"""
    SOLTEIRO = "SOLTEIRO"
    CASADO = "CASADO"
    DIVORCIADO = "DIVORCIADO"
    VIUVO = "VIUVO"
    UNIAO_ESTAVEL = "UNIAO_ESTAVEL"


# ============================================================================
# MODEL: Team (Equipe)
# ============================================================================

class Team(Base):
    """Equipes/Times de trabalho"""
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), nullable=False, unique=True)
    cor = Column(String(7), nullable=False, default="#3B82F6")
    descricao = Column(Text)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    ativa = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    manager = relationship("User", foreign_keys=[manager_id])
    employees = relationship("Employee", back_populates="team")

    def __repr__(self):
        return f"<Team {self.nome}>"


# ============================================================================
# MODEL: Employee (Colaborador)
# ============================================================================

class Employee(Base):
    """Colaborador com dados completos"""
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Dados pessoais
    nome_completo = Column(String(200), nullable=False)
    rg = Column(String(20))
    cpf = Column(String(14), unique=True, nullable=False, index=True)
    data_nascimento = Column(Date, nullable=False)
    filhos_qtd = Column(Integer, default=0)
    estado_civil = Column(SQLEnum(MaritalStatus))
    
    # Contatos
    telefone_corporativo = Column(String(20))
    telefone_pessoal = Column(String(20))
    email_corporativo = Column(String(320))
    email_pessoal = Column(String(320))
    
    # Organização
    cargo = Column(String(100), nullable=False)
    senioridade = Column(String(50))
    area = Column(String(100))
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"))
    manager_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"))
    departamento = Column(String(100), nullable=True)

    # Datas importantes
    data_admissao = Column(Date, nullable=False)
    data_desligamento = Column(Date)
    salario = Column(Numeric(10, 2), nullable=True)

    # Status
    status = Column(SQLEnum(EmployeeStatus), nullable=False, default=EmployeeStatus.ATIVO)
    
    # Dados JSON
    endereco = Column(JSONB)
    competencias = Column(JSONB)
    observacoes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="employee")
    team = relationship("Team", back_populates="employees")
    manager = relationship("Employee", remote_side=[id], backref="subordinates")

    def __repr__(self):
        return f"<Employee {self.cpf} - {self.cargo}>"

    @property
    def nome(self) -> str:
        return self.user.full_name if self.user else "N/A"

    @property
    def email(self) -> str:
        return self.email_corporativo or self.user.email if self.user else "N/A"

    @property
    def is_ativo(self) -> bool:
        return self.status == EmployeeStatus.ATIVO
