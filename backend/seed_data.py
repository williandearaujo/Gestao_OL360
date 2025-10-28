"""
Script para popular o banco de dados com dados iniciais (Admin) e de teste.
Executar da pasta 'backend': python seed_data.py
"""
import sys
import os
from datetime import date, timedelta
from sqlalchemy.orm import Session
import uuid

# Adiciona o diretório 'backend' ao path para permitir imports de 'app'
# Isso é necessário se você rodar 'python seed_data.py' de dentro da pasta 'backend'
# sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

try:
    from app.database import SessionLocal, engine, Base
    from app.models.user import User
    from app.models.employee import Employee, EmployeeTypeEnum
    from app.models.team import Team
    from app.models.area import Area
    from app.models.manager import Manager
    from app.models.knowledge import Knowledge
    from app.models.employee_knowledge import EmployeeKnowledge, StatusEnum
    from app.core.security import hash_password
except ImportError as e:
    print("[ERRO] Falha ao importar módulos:", e)
    print("       Certifique-se de que o venv está ativo e as dependências instaladas.")
    sys.exit(1)



def create_tables():
    """Cria todas as tabelas no banco de dados."""
    print("Apagando tabelas antigas (se existirem)...")
    Base.metadata.drop_all(bind=engine)
    print("Criando todas as tabelas novas...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tabelas criadas com sucesso.")


def seed_data(db: Session):
    """Popula o banco com dados iniciais e de teste."""
    print("\nIniciando o seed dos dados...")
    
    try:
        # 1. Criar Áreas
        area_diretoria = Area(nome="Diretoria", descricao="Área da Diretoria Executiva")
        area_ti = Area(nome="TI", descricao="Área de Tecnologia da Informação")
        db.add_all([area_diretoria, area_ti])
        db.commit()
        db.refresh(area_diretoria)
        db.refresh(area_ti)
        print("[OK] Áreas 'Diretoria' e 'TI' criadas.")

        # 2. Criar Times
        team_diretoria = Team(nome="Diretoria", descricao="Time da Diretoria Executiva", area_id=area_diretoria.id, ativa=True)
        team_dev = Team(nome="Desenvolvimento", descricao="Time de Desenvolvimento de Software", area_id=area_ti.id, ativa=True)
        db.add_all([team_diretoria, team_dev])
        db.commit()
        db.refresh(team_diretoria)
        db.refresh(team_dev)
        print("[OK] Times 'Diretoria' e 'Desenvolvimento' criados.")

        # 3. Criar Colaborador Admin (Willian de Araujo)
        admin_employee = Employee(
            nome_completo="Willian de Araujo",
            email_pessoal="willian.araujo@emailpessoal.com", # Fictício
            email_corporativo="diretoria@ol360.com",
            telefone_pessoal="11999998888", # Fictício
            data_nascimento=date(1990, 1, 1), # Fictício
            cpf="000.000.000-00", # Fictício
            data_admissao=date(2020, 1, 1),
            cargo="Diretor de TI",
            senioridade="Especialista",
            status="ATIVO",
            area_id=area_diretoria.id,
            team_id=team_diretoria.id,
            tipo_cadastro=EmployeeTypeEnum.DIRETOR,
            salario_atual=20000,
            ultima_alteracao_salarial=date(2024, 1, 1),
            observacoes_internas="Responsável pela governança geral do sistema.",
        )
        db.add(admin_employee)
        db.commit()
        db.refresh(admin_employee)
        print(f"[OK] Colaborador Admin '{admin_employee.nome_completo}' criado.")

        # 4. Criar Usuário Admin (com senha)
        hashed_password = hash_password("123@mudar")
        admin_user = User(
            username="willian.araujo",
            email="diretoria@ol360.com",
            hashed_password=hashed_password,
            role="diretoria",  # Permissão máxima
            is_active=True,
            is_admin=True,
            employee_id=admin_employee.id  # Vínculo com o colaborador
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"[OK] Usuário Admin '{admin_user.email}' criado com permissão 'diretoria'.")

        # 5. Criar Perfil de Manager para o Admin
        admin_manager = Manager(
            employee_id=admin_employee.id,
        )
        db.add(admin_manager)
        db.commit()
        db.refresh(admin_manager)
        print(f"[OK] Perfil de Manager criado para '{admin_employee.nome_completo}'.")
        
        # 6. Criar outros colaboradores (João, Maria, Pedro)
        joao_employee = Employee(
            nome_completo="João Silva",
            email_pessoal="joao.silva@gmail.com",
            email_corporativo="joao.silva@ol360.com",
            telefone_pessoal="(31) 98765-4321",
            data_nascimento=date(1990, 5, 15),
            cpf="123.456.789-01",
            data_admissao=date(2022, 1, 10),
            cargo="Desenvolvedor Full Stack",
            senioridade="Pleno",
            status="ATIVO",
            area_id=area_ti.id,
            team_id=team_dev.id,
            manager_id=admin_manager.id, # João é gerenciado pelo Willian
            tipo_cadastro=EmployeeTypeEnum.COLABORADOR,
            salario_atual=8500,
            ultima_alteracao_salarial=date(2024, 2, 1),
        )

        maria_employee = Employee(
            nome_completo="Maria Santos",
            email_pessoal="maria.santos@gmail.com",
            email_corporativo="maria.santos@ol360.com",
            telefone_pessoal="(11) 99876-5432",
            data_nascimento=date(1988, 8, 20),
            cpf="987.654.321-01",
            data_admissao=date(2020, 3, 15),
            cargo="Gerente de Projetos",
            senioridade="Senior",
            status="ATIVO",
            area_id=area_ti.id,
            team_id=team_dev.id,
            manager_id=admin_manager.id, # Maria é gerenciada pelo Willian
            tipo_cadastro=EmployeeTypeEnum.GERENTE,
            salario_atual=12500,
            ultima_alteracao_salarial=date(2024, 3, 1),
        )

        pedro_employee = Employee(
            nome_completo="Pedro Oliveira",
            email_pessoal="pedro.oliveira@gmail.com",
            email_corporativo="pedro.oliveira@ol360.com",
            telefone_pessoal="(21) 98888-7777",
            data_nascimento=date(1995, 12, 3),
            cpf="456.789.123-01",
            data_admissao=date(2023, 6, 1),
            cargo="Analista de Suporte",
            senioridade="Junior",
            status="ATIVO",
            area_id=area_ti.id,
            team_id=team_dev.id,
            manager_id=admin_manager.id, # Pedro é gerenciado pelo Willian
            tipo_cadastro=EmployeeTypeEnum.COLABORADOR,
            salario_atual=5200,
            ultima_alteracao_salarial=date(2024, 4, 1),
        )
        db.add_all([joao_employee, maria_employee, pedro_employee])
        db.commit()
        db.refresh(joao_employee)
        db.refresh(maria_employee)
        db.refresh(pedro_employee)
        print("[OK] Colaboradores de teste (João, Maria, Pedro) criados.")

        # 7. Criar Conhecimentos
        k_python = Knowledge(
            nome="Python Avançado",
            tipo="CERTIFICACAO",
            fornecedor="Alura",
            dificuldade="ALTO",
            prioridade="ALTA",
            status="ATIVO",
        )
        k_aws = Knowledge(
            nome="AWS Solutions Architect",
            tipo="CERTIFICACAO",
            fornecedor="AWS",
            dificuldade="ALTO",
            prioridade="ALTA",
            status="ATIVO",
            validade_meses=36,
        )
        k_scrum = Knowledge(
            nome="Scrum Master Certified",
            tipo="CURSO",
            fornecedor="Scrum.org",
            dificuldade="MEDIO",
            prioridade="MEDIA",
            status="ATIVO",
            validade_meses=24,
        )
        k_lider = Knowledge(
            nome="Liderança e Gestão",
            tipo="CURSO",
            fornecedor="Sebrae",
            dificuldade="MEDIO",
            prioridade="MEDIA",
            status="ATIVO",
        )

        db.add_all([k_python, k_aws, k_scrum, k_lider])
        db.commit()
        db.refresh(k_python)
        db.refresh(k_aws)
        db.refresh(k_scrum)
        db.refresh(k_lider)
        print("[OK] Conhecimentos criados.")

        # 8. Criar Vínculos (EmployeeKnowledge)
        v_joao_python = EmployeeKnowledge(
            employee_id=joao_employee.id,
            knowledge_id=k_python.id,
            status=StatusEnum.OBTIDO,
            data_obtencao=date(2023, 1, 1)
        )
        v_maria_scrum = EmployeeKnowledge(
            employee_id=maria_employee.id,
            knowledge_id=k_scrum.id,
            status=StatusEnum.OBTIDO,
            data_obtencao=date(2022, 5, 10)
        )
        v_maria_lider = EmployeeKnowledge(
            employee_id=maria_employee.id,
            knowledge_id=k_lider.id,
            status=StatusEnum.DESEJADO
        )
        v_pedro_aws = EmployeeKnowledge(
            employee_id=pedro_employee.id,
            knowledge_id=k_aws.id,
            status=StatusEnum.OBRIGATORIO,
            data_limite=date.today() + timedelta(days=90)
        )
        
        db.add_all([v_joao_python, v_maria_scrum, v_maria_lider, v_pedro_aws])
        db.commit()
        print("[OK] Vínculos de conhecimento criados.")

        print("\n" + "=" * 60)
        print("*** SEED DATA CONCLUÍDO! ***")
        print("=" * 60)
        print("\n[INFO] Seu usuário admin está pronto:")
        print(f"   Email: {admin_user.email}")
        print(f"   Senha: 123@mudar")

    except Exception as e:
        print(f"\n[ERRO] Ocorreu um erro durante o seed: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    print("=" * 60)
    print("SEED SCRIPT - INICIALIZAÇÃO DO BANCO DE DADOS")
    print("=" * 60)
    
    # 1. Criar tabelas
    create_tables()
    
    # 2. Popular dados
    db = SessionLocal()
    seed_data(db)


if __name__ == "__main__":
    main()
