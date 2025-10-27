"""
Model de AuditLog
Armazena histórico de mudanças em tabelas críticas.
"""
import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SqlEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.models.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Tenta pegar o user_id do token (pode ser nulo se a mudança for interna)
    user_id = Column(UUID(as_uuid=True), nullable=True) 
    
    action = Column(String(10), nullable=False) # INSERT, UPDATE, DELETE
    table_name = Column(String(100), nullable=False, index=True)
    record_id = Column(UUID(as_uuid=True), index=True) # ID do registro afetado
    
    old_values = Column(JSONB, nullable=True)
    new_values = Column(JSONB, nullable=True)

    def __repr__(self):
        return f"<AuditLog(action={self.action}, table={self.table_name}, record={self.record_id})>"
