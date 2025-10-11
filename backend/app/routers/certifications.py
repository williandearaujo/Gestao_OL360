from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_certifications():
    return {"message": "Certifications router - em desenvolvimento"}
