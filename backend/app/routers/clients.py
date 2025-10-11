from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_clients():
    return {"message": "Clients router - em desenvolvimento"}
