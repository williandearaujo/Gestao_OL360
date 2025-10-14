"""
Model de Conhecimento/Certificação
Gestão 360 - OL Tecnologia
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Numeric, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Knowledge(Base):
    """Model de Conhecimento/Certificação"""
    __tablename__ = "knowledge"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False, index=True)
    descricao = Column(Text)

    tipo = Column(String(50), nullable=False, default="CURSO", index=True)
    fornecedor = Column(String(255), index=True)
    area = Column(String(100), index=True)

    dificuldade = Column(String(20), nullable=False, default="MEDIO")
    carga_horaria = Column(Integer)
    validade_meses = Column(Integer)

    prioridade = Column(String(20), nullable=False, default="MEDIA")
    status = Column(String(20), nullable=False, default="ATIVO")
    obrigatorio = Column(Boolean, default=False)

    prerequisito_id = Column(Integer, ForeignKey("knowledge.id", ondelete="SET NULL"))

    url_referencia = Column(String(500))
    custo_estimado = Column(Numeric(10, 2))
    observacoes_internas = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    prerequisito = relationship("Knowledge", remote_side=[id], backref="dependentes")
    vinculos = relationship("EmployeeKnowledge", back_populates="knowledge", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "tipo": self.tipo,
            "fornecedor": self.fornecedor,
            "area": self.area,
            "dificuldade": self.dificuldade,
            "carga_horaria": self.carga_horaria,
            "validade_meses": self.validade_meses,
            "prioridade": self.prioridade,
            "status": self.status,
            "obrigatorio": self.obrigatorio,
            "prerequisito_id": self.prerequisito_id,
            "url_referencia": self.url_referencia,
            "custo_estimado": float(self.custo_estimado) if self.custo_estimado else None,
            "observacoes_internas": self.observacoes_internas,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }