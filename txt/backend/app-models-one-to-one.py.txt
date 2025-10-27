"""
Models One-to-One - Reuniões 1:1
"""
from sqlalchemy import Column, String, DateTime, Date, Integer, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class OneToOne(Base):
    __tablename__ = "one_to_ones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("managers.id"), nullable=False)

    # Dados da reunião
    titulo = Column(String(200), nullable=False)
    data_reuniao = Column(DateTime, nullable=False)
    duracao_minutos = Column(Integer, default=30)

    # Conteúdo
    pauta = Column(JSONB)
    topicos_discutidos = Column(JSONB)
    feedback_dado = Column(Text)
    feedback_recebido = Column(Text)

    # Ações
    acoes_definidas = Column(JSONB)
    proximos_passos = Column(Text)

    # Status
    realizada = Column(Boolean, default=False)
    data_realizacao = Column(DateTime)

    # Observações
    observacoes = Column(Text)
    anexos = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", backref="one_to_ones")
    manager = relationship("Manager", backref="one_to_ones")