from pydantic import BaseModel
from typing import Optional, Dict
from datetime import date, datetime
from uuid import UUID

class EmployeeKnowledgeBase(BaseModel):
    employee_id: UUID
    knowledge_id: UUID
    status: str = "DESEJADO"
    progresso: float = 0.0

    class Config:
        from_attributes = True

class EmployeeKnowledgeCreate(EmployeeKnowledgeBase):
    data_inicio: Optional[date] = None
    data_limite: Optional[date] = None
    observacoes: Optional[str] = None

class EmployeeKnowledgeUpdate(BaseModel):
    status: Optional[str] = None
    progresso: Optional[float] = None
    data_inicio: Optional[date] = None
    data_limite: Optional[date] = None
    data_obtencao: Optional[date] = None
    data_expiracao: Optional[date] = None
    observacoes: Optional[str] = None

    class Config:
        from_attributes = True

class EmployeeKnowledgeResponse(EmployeeKnowledgeBase):
    id: UUID
    data_inicio: Optional[date] = None
    data_limite: Optional[date] = None
    data_obtencao: Optional[date] = None
    data_expiracao: Optional[date] = None
    observacoes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    employee_nome: Optional[str] = None
    knowledge_nome: Optional[str] = None

class EmployeeKnowledgeDetail(EmployeeKnowledgeResponse):
    knowledge_name: Optional[str] = None
    knowledge_type: Optional[str] = None
    employee_name: Optional[str] = None
    employee_cargo: Optional[str] = None

    class Config:
        from_attributes = True

class EmployeeKnowledgeStats(BaseModel):
    employee_id: UUID
    employee_name: str
    total_knowledge: int
    by_type: Dict[str, int]
    by_level: Dict[str, int]
    certifications_count: int
    expiring_soon: int
    completion_rate: float

    class Config:
        from_attributes = True
