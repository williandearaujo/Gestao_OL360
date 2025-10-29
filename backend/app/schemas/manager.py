from pydantic import BaseModel, computed_field
from uuid import UUID
from typing import Optional


class ManagerBase(BaseModel):
    employee_id: UUID


class ManagerCreate(ManagerBase):
    pass


class ManagerResponse(ManagerBase):
    id: UUID

    @computed_field
    @property
    def nome_completo(self) -> Optional[str]:
        if hasattr(self, "employee") and self.employee:
            return self.employee.nome_completo
        return None

    class Config:
        from_attributes = True
