# ============================================================================
# EMPLOYEE KNOWLEDGE SCHEMAS
# Arquivo: backend/app/schemas/employee_knowledge.py
# ============================================================================
class EmployeeKnowledgeBase(BaseModel):
    employee_id: int
    knowledge_id: int
    status: str = "DESEJADO"
    progresso: float = 0.0


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


class EmployeeKnowledgeResponse(EmployeeKnowledgeBase):
    id: int
    data_inicio: Optional[date] = None
    data_limite: Optional[date] = None
    data_obtencao: Optional[date] = None
    data_expiracao: Optional[date] = None
    observacoes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    employee_nome: Optional[str] = None
    knowledge_nome: Optional[str] = None

    class Config:
        from_attributes = True