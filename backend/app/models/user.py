"""
Models User - Representa um usuário do sistema (com login e senha)
"""
import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash

from app.models.base import Base
# Importar Employee explicitamente ajuda com a definição da relação
from app.models.employee import Employee

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="colaborador") # Ex: admin, gerente, colaborador
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    last_login = Column(DateTime(timezone=True), nullable=True)
    login_count = Column(Integer, default=0)

    # Chave estrangeira para ligar User a Employee (NÃO NULA)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), unique=True, nullable=False)

    # Relacionamento One-to-One com Employee
    employee = relationship(
        "Employee",
        back_populates="user",
        uselist=False,
        # MUDANÇA: Especificando explicitamente a condição de join
        primaryjoin="User.employee_id == Employee.id"
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)
