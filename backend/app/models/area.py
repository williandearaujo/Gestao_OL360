"""
Models Area - Áreas/Departamentos
"""
import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

class Area(Base):
    __tablename__ = "areas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), unique=True, nullable=False)
    descricao = Column(String(255))

    # Relacionamento: Uma área pode ter múltiplos funcionários
    employees = relationship("Employee", back_populates="area")

   

