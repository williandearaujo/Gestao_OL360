from pydantic import BaseModel
from uuid import UUID

class ManagerBase(BaseModel):
    employee_id: UUID

class ManagerCreate(ManagerBase):
    pass

class ManagerResponse(ManagerBase):
    id: UUID

    class Config:
        from_attributes = True
