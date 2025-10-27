import uuid
import enum
from sqlalchemy import Column, String, Float, Date, ForeignKey, Text, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import Enum as SQLEnum
from app.models.base import Base

class StatusEnum(str, enum.Enum):
    DESEJADO = "DESEJADO"
    OBTIDO = "OBTIDO"
    OBRIGATORIO = "OBRIGATORIO"

class EmployeeKnowledge(Base):
    __tablename__ = "employee_knowledge"
    __table_args__ = (
        UniqueConstraint('employee_id', 'knowledge_id', name='uq_employee_knowledge'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    knowledge_id = Column(UUID(as_uuid=True), ForeignKey("knowledge.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(
        SQLEnum(StatusEnum, name="status_enum", native_enum=False),
        nullable=False,
        default=StatusEnum.DESEJADO,
        index=True
    )
    progresso = Column(Float, default=0.0)
    data_inicio = Column(Date)
    data_limite = Column(Date)
    data_obtencao = Column(Date)
    data_expiracao = Column(Date)
    certificado_url = Column(String(500), nullable=True)
    observacoes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    employee = relationship("Employee", back_populates="knowledges")
    knowledge = relationship("Knowledge", back_populates="vinculos")

    def to_dict(self):
        return {
            "id": str(self.id),
            "employee_id": str(self.employee_id),
            "knowledge_id": str(self.knowledge_id),
            "status": self.status.value if isinstance(self.status, enum.Enum) else self.status,
            "progresso": self.progresso,
            "data_inicio": self.data_inicio.isoformat() if self.data_inicio else None,
            "data_limite": self.data_limite.isoformat() if self.data_limite else None,
            "data_obtencao": self.data_obtencao.isoformat() if self.data_obtencao else None,
            "data_expiracao": self.data_expiracao.isoformat() if self.data_expiracao else None,
            "certificado_url": self.certificado_url,
            "observacoes": self.observacoes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "employee_nome": self.employee.nome if self.employee else None,
            "knowledge_nome": self.knowledge.nome if self.knowledge else None,
        }
