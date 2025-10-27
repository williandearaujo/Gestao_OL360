"""
Models PDI - Plano de Desenvolvimento Individual
"""
from sqlalchemy import Column, String, DateTime, Date, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class PDIStatus(str, enum.Enum):
    PLANEJADO = "PLANEJADO"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDO = "CONCLUIDO"
    CANCELADO = "CANCELADO"


class PDI(Base):
    __tablename__ = "pdis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    # Dados do PDI
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text)
    objetivos = Column(JSONB)
    acoes = Column(JSONB)
    recursos_necessarios = Column(JSONB)

    # Prazos
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date)
    data_conclusao = Column(Date)

    # Status
    status = Column(SQLEnum(PDIStatus), nullable=False, default=PDIStatus.PLANEJADO)
    progresso = Column(Integer, default=0)

    # Avaliação
    avaliacao_final = Column(Text)
    nota_final = Column(Integer)

    # Observações
    observacoes = Column(Text)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship
    employee = relationship("Employee", backref="pdis")