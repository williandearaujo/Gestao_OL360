"""
Model de Relacionamento Colaborador-Conhecimento
Gestão 360 - OL Tecnologia
"""
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class EmployeeKnowledge(Base):
    """Model de vínculo entre Colaborador e Conhecimento"""
    __tablename__ = "employee_knowledge"
    __table_args__ = (
        UniqueConstraint('employee_id', 'knowledge_id', name='uq_employee_knowledge'),
    )

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    knowledge_id = Column(Integer, ForeignKey("knowledge.id", ondelete="CASCADE"), nullable=False, index=True)

    status = Column(String(50), nullable=False, default="DESEJADO", index=True)
    progresso = Column(Float, default=0.0)

    data_inicio = Column(Date)
    data_limite = Column(Date)
    data_obtencao = Column(Date)
    data_expiracao = Column(Date)

    observacoes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    employee = relationship("Employee", back_populates="conhecimentos")
    knowledge = relationship("Knowledge", back_populates="vinculos")

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "knowledge_id": self.knowledge_id,
            "status": self.status,
            "progresso": self.progresso,
            "data_inicio": self.data_inicio.isoformat() if self.data_inicio else None,
            "data_limite": self.data_limite.isoformat() if self.data_limite else None,
            "data_obtencao": self.data_obtencao.isoformat() if self.data_obtencao else None,
            "data_expiracao": self.data_expiracao.isoformat() if self.data_expiracao else None,
            "observacoes": self.observacoes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "employee_nome": self.employee.nome if self.employee else None,
            "knowledge_nome": self.knowledge.nome if self.knowledge else None,
        }