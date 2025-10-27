"""
Script de Inicialização do Banco de Dados
Gestão 360 - OL Tecnologia
"""
import sys
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import date, timedelta
from app.database import SessionLocal, engine
from app.models.base import Base
from app.core.security import hash_password

# Importar apenas após adicionar ao path
from app.models.user import User
from app.models.area import Area
from app.models.team import Team
from app.models.manager import Manager
from app.models.employee import Employee
from app.models.knowledge import Knowledge
from app.models.employee_knowledge import EmployeeKnowledge


def init_database():
    """Inicializa o banco de dados com dados de exemplo"""

    print("🔄 Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas!")

    db = SessionLocal()

    try:
        # Verificar se já existe usuário admin
        existing_admin = db.query(User).filter(User.email == "admin@ol360.com").first()
        if existing_admin:
            print("⚠️  Banco já inicializado. Usuário admin já existe.")
            print("💡 Se quiser reinicializar, delete os dados manualmente no Supabase.")
            return

        # ====================================================================
        # USUÁRIOS
        # ====================================================================
        print("\n👥 Criando usuários...")

        users_data = [
            {
                "username": "admin",
                "email": "admin@ol360.com",
                "password": "Admin@123456",
                "role": "admin",
                "is_admin": True
            },
            {
                "username": "diretoria",
                "email": "diretoria@ol360.com",
                "password": "Diretoria@123",
                "role": "diretoria",
                "is_admin": True
            },
            {
                "username": "gerente1",
                "email": "gerente1@ol360.com",
                "password": "Gerente@123",
                "role": "gerente",
                "is_admin": False
            },
            {
                "username": "colaborador1",
                "email": "colaborador1@ol360.com",
                "password": "Colab@123",
                "role": "colaborador",
                "is_admin": False
            }
        ]

        users = []
        for user_data in users_data:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=hash_password(user_data["password"]),
                role=user_data["role"],
                is_admin=user_data["is_admin"],
                is_active=True
            )
            db.add(user)
            users.append(user)

        db.commit()
        print(f"✅ {len(users)} usuários criados!")

        # ====================================================================
        # ÁREAS
        # ====================================================================
        print("\n🏢 Criando áreas...")

        areas_data = [
            {"nome": "Tecnologia", "sigla": "TI", "cor": "#3B82F6"},
            {"nome": "Recursos Humanos", "sigla": "RH", "cor": "#10B981"},
            {"nome": "Comercial", "sigla": "COM", "cor": "#F59E0B"},
            {"nome": "Financeiro", "sigla": "FIN", "cor": "#8B5CF6"},
        ]

        areas = []
        for area_data in areas_data:
            area = Area(**area_data)
            db.add(area)
            areas.append(area)

        db.commit()
        print(f"✅ {len(areas)} áreas criadas!")

        # ====================================================================
        # TIMES
        # ====================================================================
        print("\n👥 Criando times...")

        teams_data = [
            {"nome": "DevOps", "area_id": 1, "descricao": "Time de DevOps e Infraestrutura"},
            {"nome": "Frontend", "area_id": 1, "descricao": "Time de Desenvolvimento Frontend"},
            {"nome": "Backend", "area_id": 1, "descricao": "Time de Desenvolvimento Backend"},
            {"nome": "Recrutamento", "area_id": 2, "descricao": "Time de Recrutamento e Seleção"},
        ]

        teams = []
        for team_data in teams_data:
            team = Team(**team_data)
            db.add(team)
            teams.append(team)

        db.commit()
        print(f"✅ {len(teams)} times criados!")

        # ====================================================================
        # COLABORADORES
        # ====================================================================
        print("\n👨‍💼 Criando colaboradores...")

        employees_data = [
            {
                "nome": "João Silva",
                "email": "joao.silva@ol360.com",
                "cpf": "12345678901",
                "cargo": "Desenvolvedor Senior",
                "data_admissao": date.today() - timedelta(days=365),
                "salario": 8000.00,
                "team_id": 2,
                "status": "ATIVO",
                "user_id": 4
            },
            {
                "nome": "Maria Santos",
                "email": "maria.santos@ol360.com",
                "cpf": "98765432109",
                "cargo": "Analista de RH",
                "data_admissao": date.today() - timedelta(days=730),
                "salario": 6000.00,
                "team_id": 4,
                "status": "ATIVO"
            },
            {
                "nome": "Pedro Oliveira",
                "email": "pedro.oliveira@ol360.com",
                "cpf": "45678912305",
                "cargo": "DevOps Engineer",
                "data_admissao": date.today() - timedelta(days=180),
                "salario": 9000.00,
                "team_id": 1,
                "status": "ATIVO"
            }
        ]

        employees = []
        for emp_data in employees_data:
            employee = Employee(
                **emp_data,
                ferias_dados={"dias_disponiveis": 30, "periodos": []},
                pdi_dados={"checks": [], "objetivos": []},
                reunioes_1x1={"historico": [], "proxima": None}
            )
            db.add(employee)
            employees.append(employee)

        db.commit()
        print(f"✅ {len(employees)} colaboradores criados!")

        # ====================================================================
        # GESTORES
        # ====================================================================
        print("\n👔 Criando gestores...")

        manager = Manager(
            employee_id=employees[0].id,
            area_id=areas[0].id,
            nivel_hierarquico=2,
            tipo_lideranca="TECNICA",
            data_promocao=date.today() - timedelta(days=180)
        )
        db.add(manager)
        db.commit()
        print("✅ 1 gestor criado!")

        # ====================================================================
        # CONHECIMENTOS
        # ====================================================================
        print("\n🎓 Criando conhecimentos...")

        knowledge_data = [
            {
                "nome": "AWS Solutions Architect",
                "descricao": "Certificação AWS Solutions Architect Associate",
                "tipo": "CERTIFICACAO",
                "fornecedor": "AWS",
                "area": "Cloud",
                "dificuldade": "AVANCADO",
                "carga_horaria": 40,
                "validade_meses": 36,
                "prioridade": "ALTA",
                "obrigatorio": False
            },
            {
                "nome": "React Avançado",
                "descricao": "Curso avançado de React com Hooks e Context API",
                "tipo": "CURSO",
                "fornecedor": "Udemy",
                "area": "Frontend",
                "dificuldade": "AVANCADO",
                "carga_horaria": 20,
                "prioridade": "MEDIA"
            },
            {
                "nome": "Python para Data Science",
                "descricao": "Curso completo de Python aplicado a Data Science",
                "tipo": "CURSO",
                "fornecedor": "Coursera",
                "area": "Data Science",
                "dificuldade": "MEDIO",
                "carga_horaria": 30,
                "prioridade": "MEDIA"
            },
            {
                "nome": "Kubernetes Fundamentals",
                "descricao": "Fundamentos de Kubernetes e orquestração de containers",
                "tipo": "TREINAMENTO",
                "fornecedor": "Linux Foundation",
                "area": "DevOps",
                "dificuldade": "AVANCADO",
                "carga_horaria": 25,
                "prioridade": "ALTA"
            }
        ]

        knowledges = []
        for know_data in knowledge_data:
            knowledge = Knowledge(**know_data)
            db.add(knowledge)
            knowledges.append(knowledge)

        db.commit()
        print(f"✅ {len(knowledges)} conhecimentos criados!")

        # ====================================================================
        # VÍNCULOS COLABORADOR-CONHECIMENTO
        # ====================================================================
        print("\n🔗 Criando vínculos...")

        vinculos_data = [
            {
                "employee_id": employees[0].id,
                "knowledge_id": knowledges[1].id,
                "status": "OBTIDO",
                "progresso": 100.0,
                "data_inicio": date.today() - timedelta(days=60),
                "data_obtencao": date.today() - timedelta(days=10)
            },
            {
                "employee_id": employees[2].id,
                "knowledge_id": knowledges[3].id,
                "status": "EM_PROGRESSO",
                "progresso": 60.0,
                "data_inicio": date.today() - timedelta(days=30),
                "data_limite": date.today() + timedelta(days=30)
            }
        ]

        vinculos = []
        for vinculo_data in vinculos_data:
            vinculo = EmployeeKnowledge(**vinculo_data)
            db.add(vinculo)
            vinculos.append(vinculo)

        db.commit()
        print(f"✅ {len(vinculos)} vínculos criados!")

        print("\n" + "="*60)
        print("✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!")
        print("="*60)
        print("\n📊 Resumo:")
        print(f"   • {len(users)} usuários")
        print(f"   • {len(areas)} áreas")
        print(f"   • {len(teams)} times")
        print(f"   • {len(employees)} colaboradores")
        print(f"   • 1 gestor")
        print(f"   • {len(knowledges)} conhecimentos")
        print(f"   • {len(vinculos)} vínculos")

        print("\n🔐 Credenciais de Acesso:")
        print("   Admin: admin@ol360.com / Admin@123456")
        print("   Diretoria: diretoria@ol360.com / Diretoria@123")
        print("   Gerente: gerente1@ol360.com / Gerente@123")
        print("   Colaborador: colaborador1@ol360.com / Colab@123")

    except Exception as e:
        print(f"\n❌ Erro ao inicializar banco: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_database()