from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: str = Field(default="colaborador")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    is_active: bool = True
    employee_id: UUID

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    employee_id: Optional[UUID] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    is_admin: bool
    employee_id: UUID
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    login_count: int = 0

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse]
