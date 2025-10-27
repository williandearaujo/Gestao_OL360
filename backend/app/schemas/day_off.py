from pydantic import BaseModel
from datetime import date
from typing import Optional
from uuid import UUID

# Schema base com campos compartilhados
class DayOffBase(BaseModel):
    date: date
    status: Optional[str] = "AGENDADO"

# Schema para criar um novo Day Off via API
class DayOffCreate(DayOffBase):
    employee_id: UUID

# Schema para ler/retornar um Day Off da API
class DayOff(DayOffBase):
    id: int
    employee_id: UUID

    class Config:
        from_attributes = True # CORRIGIDO