"""
Model de Team/Equipe
Gestão 360 - OL Tecnologia
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Team(Base):
    """Model de Equipe/Time"""
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False, index=True)
    descricao = Column(Text)
    area_id = Column(Integer, ForeignKey("areas.id", ondelete="CASCADE"), nullable=False)
    lider_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"))
    ativa = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    area = relationship("Area", back_populates="teams")
    lider = relationship("Employee", foreign_keys=[lider_id])
    members = relationship("Employee", back_populates="team", foreign_keys="Employee.team_id")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "area_id": self.area_id,
            "lider_id": self.lider_id,
            "ativa": self.ativa,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }