"""
Model de Manager/Gestor
Gestão 360 - OL Tecnologia
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Manager(Base):
    """Model de Gestor"""
    __tablename__ = "managers"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, unique=True)
    area_id = Column(Integer, ForeignKey("areas.id", ondelete="CASCADE"), nullable=False)
    nivel_hierarquico = Column(Integer, nullable=False, default=1)
    data_promocao = Column(Date)
    tipo_lideranca = Column(String(50), default="FUNCIONAL")
    metas_anuais = Column(Text)
    objetivos_trimestrais = Column(JSON, default=dict)
    ativo = Column(String(50), nullable=False, default="ATIVO")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    employee = relationship("Employee", foreign_keys=[employee_id])
    area = relationship("Area", back_populates="managers")
    subordinados = relationship("Employee", back_populates="manager", foreign_keys="Employee.manager_id")

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "area_id": self.area_id,
            "nivel_hierarquico": self.nivel_hierarquico,
            "data_promocao": self.data_promocao.isoformat() if self.data_promocao else None,
            "tipo_lideranca": self.tipo_lideranca,
            "metas_anuais": self.metas_anuais,
            "objetivos_trimestrais": self.objetivos_trimestrais,
            "ativo": self.ativo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }