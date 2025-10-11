"""
Models SQLAlchemy - User e Employee
"""

from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Numeric, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid
import enum

from app.database import Base


# ============================================================================
# ENUMS
# ============================================================================

class UserRole(str, enum.Enum):
    """Roles de usuário no sistema"""
    DIRETORIA = "DIRETORIA"
    GERENTE = "GERENTE"
    COLABORADOR = "COLABORADOR"
    ADMIN_GESTAO = "ADMIN_GESTAO"


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
# MODEL: User (Usuário do Sistema)
# ============================================================================

class User(Base):
    """
    Usuário do sistema com autenticação
    Separado de Employee para permitir usuários sem vínculo empregatício
    """
    __tablename__ = "users"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Credenciais
    email = Column(String(320), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Informações básicas
    full_name = Column(String(200), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.COLABORADOR)

    # Status
    is_active = Column(Boolean, nullable=False, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    # Relacionamentos
    employee = relationship("Employee", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"

    @property
    def is_diretoria(self) -> bool:
        """Verifica se é diretoria"""
        return self.role == UserRole.DIRETORIA

    @property
    def is_gerente(self) -> bool:
        """Verifica se é gerente"""
        return self.role == UserRole.GERENTE

    @property
    def is_admin_gestao(self) -> bool:
        """Verifica se é admin de gestão"""
        return self.role == UserRole.ADMIN_GESTAO

    @property
    def can_approve_requests(self) -> bool:
        """Verifica se pode aprovar solicitações"""
        return self.role in [UserRole.DIRETORIA, UserRole.GERENTE]