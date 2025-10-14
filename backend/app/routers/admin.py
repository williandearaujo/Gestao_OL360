"""
Router de Administração - COMPLETO E CORRIGIDO
Gestão 360 - OL Tecnologia
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.core.security import get_current_user, hash_password, verify_password
from app.schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/admin", tags=["Administração"])


# ============================================================================
# DASHBOARD ADMIN
# ============================================================================
@router.get("/dashboard")
async def get_admin_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna estatísticas gerais do sistema para o dashboard admin
    """
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar."
        )

    try:
        # Importar models aqui para evitar circular import
        from app.models import Employee, Knowledge, Area, Team

        # Contar registros
        total_usuarios = db.query(User).count()
        usuarios_ativos = db.query(User).filter(User.is_active == True).count()
        total_colaboradores = db.query(Employee).count()
        colaboradores_ativos = db.query(Employee).filter(Employee.status == "ATIVO").count()
        total_conhecimentos = db.query(Knowledge).count()
        conhecimentos_ativos = db.query(Knowledge).filter(Knowledge.status == "ATIVO").count()
        total_areas = db.query(Area).count()
        total_teams = db.query(Team).count()

        return {
            "message": "Dashboard carregado com sucesso",
            "data": {
                "usuarios": {
                    "total": total_usuarios,
                    "ativos": usuarios_ativos,
                    "inativos": total_usuarios - usuarios_ativos
                },
                "colaboradores": {
                    "total": total_colaboradores,
                    "ativos": colaboradores_ativos,
                    "inativos": total_colaboradores - colaboradores_ativos
                },
                "conhecimentos": {
                    "total": total_conhecimentos,
                    "ativos": conhecimentos_ativos,
                    "inativos": total_conhecimentos - conhecimentos_ativos
                },
                "estrutura": {
                    "areas": total_areas,
                    "times": total_teams
                },
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao carregar dashboard: {str(e)}"
        )


# ============================================================================
# GESTÃO DE USUÁRIOS
# ============================================================================
@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todos os usuários do sistema"""
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    query = db.query(User)

    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )

    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna um usuário específico"""
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return user


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria um novo usuário"""
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    # Verificar se username ou email já existem
    existing_user = db.query(User).filter(
        (User.username == user_data.username) |
        (User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username ou email já cadastrado"
        )

    # Criar novo usuário
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        is_active=user_data.is_active,
        is_admin=user_data.role in ["ADMIN", "DIRETORIA"]
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza um usuário existente"""
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Atualizar campos
    if user_data.username:
        user.username = user_data.username
    if user_data.email:
        user.email = user_data.email
    if user_data.password:
        user.hashed_password = hash_password(user_data.password)
    if user_data.role:
        user.role = user_data.role
        user.is_admin = user_data.role in ["ADMIN", "DIRETORIA"]
    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)

    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta um usuário"""
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    # Não permitir deletar a si mesmo
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Não é possível deletar seu próprio usuário")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    db.delete(user)
    db.commit()

    return None


# ============================================================================
# CONFIGURAÇÕES DO SISTEMA
# ============================================================================
@router.get("/settings")
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna configurações do sistema"""
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    return {
        "sistema": {
            "versao": "1.0.0",
            "ambiente": "production",
            "database": "PostgreSQL/Supabase"
        },
        "configuracoes": {
            "max_upload_size": 10485760,  # 10MB
            "session_timeout": 3600,       # 1 hora
            "password_min_length": 8,
            "enable_notifications": True
        }
    }


@router.get("/logs")
async def get_system_logs(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna logs do sistema (placeholder)"""
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    # TODO: Implementar sistema de logs
    return {
        "message": "Sistema de logs em desenvolvimento",
        "logs": []
    }