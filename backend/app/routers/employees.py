"""
Router de Colaboradores - COMPLETO
Gestão 360 - OL Tecnologia
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, date

from app.database import get_db
from app.models.user import User
from app.models.employee import Employee
from app.core.security import get_current_user
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["Colaboradores"])


# ============================================================================
# LISTAR COLABORADORES
# ============================================================================
@router.get("/", response_model=List[EmployeeResponse])
async def list_employees(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = Query(None, description="Filtrar por status"),
    team_id: Optional[int] = Query(None, description="Filtrar por time"),
    cargo: Optional[str] = Query(None, description="Filtrar por cargo"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todos os colaboradores com filtros opcionais
    """
    query = db.query(Employee)

    # Aplicar filtros
    if search:
        query = query.filter(
            or_(
                Employee.nome.ilike(f"%{search}%"),
                Employee.email.ilike(f"%{search}%"),
                Employee.cargo.ilike(f"%{search}%")
            )
        )

    if status:
        query = query.filter(Employee.status == status)

    if team_id:
        query = query.filter(Employee.team_id == team_id)

    if cargo:
        query = query.filter(Employee.cargo.ilike(f"%{cargo}%"))

    # Ordenar por nome
    query = query.order_by(Employee.nome)

    employees = query.offset(skip).limit(limit).all()
    return employees


# ============================================================================
# BUSCAR COLABORADOR POR ID
# ============================================================================
@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna um colaborador específico por ID
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )

    return employee


# ============================================================================
# CRIAR COLABORADOR
# ============================================================================
@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo colaborador
    """
    # Verificar permissão
    if current_user.role not in ["ADMIN", "DIRETORIA", "GERENTE"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar colaboradores"
        )

    # Verificar se email já existe
    existing = db.query(Employee).filter(Employee.email == employee_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )

    # Verificar CPF se fornecido
    if employee_data.cpf:
        existing_cpf = db.query(Employee).filter(Employee.cpf == employee_data.cpf).first()
        if existing_cpf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF já cadastrado"
            )

    # Criar colaborador
    new_employee = Employee(
        nome=employee_data.nome,
        email=employee_data.email,
        cpf=employee_data.cpf,
        data_nascimento=employee_data.data_nascimento,
        telefone=employee_data.telefone,
        endereco=employee_data.endereco,
        cargo=employee_data.cargo,
        data_admissao=employee_data.data_admissao or date.today(),
        salario=employee_data.salario,
        team_id=employee_data.team_id,
        manager_id=employee_data.manager_id,
        user_id=employee_data.user_id,
        status=employee_data.status,
        ferias_dados={"dias_disponiveis": 30, "periodos": []},
        pdi_dados={"checks": [], "objetivos": []},
        reunioes_1x1={"historico": [], "proxima": None}
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


# ============================================================================
# ATUALIZAR COLABORADOR
# ============================================================================
@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza dados de um colaborador
    """
    # Buscar colaborador
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )

    # Verificar permissão
    if current_user.role not in ["ADMIN", "DIRETORIA", "GERENTE"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar colaboradores"
        )

    # Atualizar campos fornecidos
    update_data = employee_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


# ============================================================================
# DELETAR COLABORADOR
# ============================================================================
@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove um colaborador do sistema
    """
    # Verificar permissão
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem deletar colaboradores"
        )

    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )

    db.delete(employee)
    db.commit()

    return None


# ============================================================================
# PDI - PLANO DE DESENVOLVIMENTO INDIVIDUAL
# ============================================================================
@router.get("/{employee_id}/pdi")
async def get_employee_pdi(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna o PDI de um colaborador
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    return {
        "employee_id": employee.id,
        "employee_nome": employee.nome,
        "pdi_dados": employee.pdi_dados or {"checks": [], "objetivos": []},
        "data_proximo_pdi": employee.data_proximo_pdi
    }


@router.put("/{employee_id}/pdi")
async def update_employee_pdi(
    employee_id: int,
    pdi_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza o PDI de um colaborador
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    employee.pdi_dados = pdi_data
    employee.data_proximo_pdi = pdi_data.get("data_proximo_pdi")

    db.commit()
    db.refresh(employee)

    return {"message": "PDI atualizado com sucesso", "pdi": employee.pdi_dados}


# ============================================================================
# FÉRIAS
# ============================================================================
@router.get("/{employee_id}/ferias")
async def get_employee_ferias(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna dados de férias de um colaborador
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    return {
        "employee_id": employee.id,
        "employee_nome": employee.nome,
        "ferias_dados": employee.ferias_dados or {"dias_disponiveis": 30, "periodos": []}
    }


# ============================================================================
# ESTATÍSTICAS
# ============================================================================
@router.get("/stats/overview")
async def get_employees_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna estatísticas gerais dos colaboradores
    """
    total = db.query(Employee).count()
    ativos = db.query(Employee).filter(Employee.status == "ATIVO").count()
    ferias = db.query(Employee).filter(Employee.status == "FERIAS").count()
    afastados = db.query(Employee).filter(Employee.status == "AFASTADO").count()
    desligados = db.query(Employee).filter(Employee.status == "DESLIGADO").count()

    return {
        "total": total,
        "ativos": ativos,
        "ferias": ferias,
        "afastados": afastados,
        "desligados": desligados,
        "timestamp": datetime.now().isoformat()
    }