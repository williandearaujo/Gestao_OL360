"""
Schemas de Autenticação - CORRIGIDO
Adiciona imports faltantes
"""
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Base Schema
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


# Enums
class RoleEnum(str, Enum):
    ADMIN = "admin"
    DIRETORIA = "diretoria"
    GERENTE = "gerente"
    COLABORADOR = "colaborador"
    ADMIN_GESTAO = "admin_gestao"


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[Dict[str, Any]] = None


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


# Login
class LoginRequest(BaseModel):
    username: str
    password: str


# User schemas
class UserBase(BaseSchema):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=200)
    role: RoleEnum = Field(default=RoleEnum.COLABORADOR)
    is_active: bool = Field(default=True)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Senha deve ter no mínimo 6 caracteres')
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


# Permission schemas
class Permission(BaseSchema):
    id: int
    resource: str = Field(..., max_length=100)
    action: str = Field(..., max_length=50)
    description: Optional[str] = None


class PermissionCreate(BaseModel):
    resource: str
    action: str
    description: Optional[str] = None


# Role schemas
class Role(BaseSchema):
    id: int
    name: str = Field(..., max_length=50)
    description: Optional[str] = None
    is_system_role: bool = Field(default=False)
    permissions: List[Permission] = []  # CORRIGIDO - List estava sem import


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    permission_ids: List[int] = []


# Session schemas
class UserSession(BaseSchema):
    user_id: int
    token: str
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


# Password change
class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

    @validator('new_password')
    def validate_new_password(cls, v, values):
        if 'current_password' in values and v == values['current_password']:
            raise ValueError('Nova senha deve ser diferente da atual')
        return v


# Password reset
class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)