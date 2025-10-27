from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_requests():
    return {"message": "Requests router - em desenvolvimento"}
