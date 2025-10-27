"""
Router de Autenticação - Versão com banco, bcrypt e JWT
"""
from fastapi import APIRouter, HTTPException, status, Request, Depends
from sqlalchemy.orm import Session, joinedload # MUDANÇA: Importar joinedload
from datetime import datetime
import logging

from app.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.employee import Employee # MUDANÇA: Importar Employee
from app.core.security import verify_password
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, Token, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["🔐 Autenticação"])

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/login", response_model=Token)
async def login(request: Request, credentials: LoginRequest, db: Session = Depends(get_db)):
    logger.info("=" * 50)
    logger.info("📥 REQUEST RECEBIDA NO BACKEND")
    logger.info(f"Method: {request.method}")
    logger.info(f"URL: {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"✅ Body recebido (via Pydantic): Email: {credentials.email} | Password length: {len(credentials.password)}")

    # MUDANÇA: Fazer join com Employee para buscar o nome completo
    user = db.query(User).options(joinedload(User.employee)).filter(User.email == credentials.email).first()

    if not user:
        logger.error(f"❌ Usuário não encontrado: {credentials.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos")

    if not verify_password(credentials.password, user.hashed_password):
        logger.error(f"❌ Senha incorreta para: {credentials.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos")

    if not user.is_active:
        logger.error(f"❌ Usuário inativo: {credentials.email}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário inativo")

    user.last_login = datetime.utcnow()
    user.login_count = (user.login_count or 0) + 1
    db.commit()

    access_token = create_access_token({"sub": str(user.id), "role": user.role, "is_admin": user.is_admin})

    # MUDANÇA: Usar `user.employee.nome_completo` se existir, senão `user.username`
    user_full_name = user.username
    if user.employee and user.employee.nome_completo:
        user_full_name = user.employee.nome_completo

    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user_full_name, # MUDANÇA: de username para full_name
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "login_count": user.login_count,
        }
    }

    logger.info(f"✅ LOGIN SUCCESSFUL - Token gerado para: {credentials.email}")
    logger.info("=" * 50)

    return response_data


@router.get("/me", response_model=UserResponse)
async def get_current_user_route(current_user: User = Depends(get_current_user)):
    """Rota protegida que retorna o usuário atual"""
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout simulado, rota protegida"""
    return {"message": f"Logout realizado com sucesso para {current_user.email}"}


@router.get("/health")
async def auth_health():
    return {
        "status": "ok",
        "message": "🔐 Autenticação funcionando",
        "endpoint": "/auth/login"
    }
