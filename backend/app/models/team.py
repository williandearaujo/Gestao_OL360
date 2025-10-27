"""
Model de Team/Equipe
Gestão 360 - OL Tecnologia
"""
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.models.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.employee import Employee


class Team(Base):
    """Model de Equipe/Time"""
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nome = Column(String(100), nullable=False, index=True)
    descricao = Column(Text)
    area_id = Column(UUID(as_uuid=True), ForeignKey("areas.id", ondelete="CASCADE"), nullable=False)
    lider_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"))
    ativa = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    area = relationship("Area", back_populates="teams")
    lider = relationship("Employee", foreign_keys=[lider_id])

    # --- CORREÇÃO AQUI ---
    # O nome da propriedade deve ser "employees" (para bater com employee.py)
    # E o back_populates deve ser "team" (para bater com employee.py)
    employees = relationship(
        "Employee",
        back_populates="team",
        foreign_keys="Employee.team_id"
    )
    # --- FIM DA CORREÇÃO ---

    def to_dict(self):
        return {
            "id": str(self.id),
            "nome": self.nome,
            "descricao": self.descricao,
            "area_id": str(self.area_id) if self.area_id else None,
            "lider_id": str(self.lider_id) if self.lider_id else None,
            "ativa": self.ativa,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

# A linha duplicada que estava aqui fora foi removida.
