"""
Script para popular o banco de dados com dados de teste
Execute: python seed_data.py
"""
import requests
import json
from datetime import date, timedelta

API_URL = "http://localhost:8000"


# Login como admin
def login_admin():
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"username": "admin@ol360.com", "password": "Admin@123456"}
    )
    if response.status_code == 200:
        data = response.json()
        return data["access_token"]
    else:
        print(f"❌ Erro no login: {response.text}")
        return None


# Criar colaboradores de exemplo
def criar_colaboradores(token):
    headers = {"Authorization": f"Bearer {token}"}

    colaboradores = [
        {
            "nome_completo": "João Silva",
            "cpf": "12345678901",
            "rg": "MG1234567",
            "data_nascimento": "1990-05-15",
            "estado_civil": "Casado",
            "email_pessoal": "joao.silva@gmail.com",
            "email_corporativo": "joao.silva@ol360.com",
            "telefone_pessoal": "(31) 98765-4321",
            "telefone_corporativo": "(31) 3333-1111",
            "endereco": "Rua das Flores, 123 - Belo Horizonte/MG",
            "cargo": "Desenvolvedor Full Stack",
            "departamento": "Tecnologia",
            "data_admissao": "2022-01-10",
            "salario": 8000.00,
            "status": "ATIVO"
        },
        {
            "nome_completo": "Maria Santos",
            "cpf": "98765432101",
            "rg": "SP9876543",
            "data_nascimento": "1988-08-20",
            "estado_civil": "Solteira",
            "email_pessoal": "maria.santos@gmail.com",
            "email_corporativo": "maria.santos@ol360.com",
            "telefone_pessoal": "(11) 99876-5432",
            "telefone_corporativo": "(11) 3333-2222",
            "endereco": "Av. Paulista, 1000 - São Paulo/SP",
            "cargo": "Gerente de Projetos",
            "departamento": "Gestão",
            "data_admissao": "2020-03-15",
            "salario": 12000.00,
            "status": "ATIVO"
        },
        {
            "nome_completo": "Pedro Oliveira",
            "cpf": "45678912301",
            "rg": "RJ4567891",
            "data_nascimento": "1995-12-03",
            "estado_civil": "Solteiro",
            "email_pessoal": "pedro.oliveira@gmail.com",
            "email_corporativo": "pedro.oliveira@ol360.com",
            "telefone_pessoal": "(21) 98888-7777",
            "telefone_corporativo": "(21) 3333-3333",
            "endereco": "Rua do Comércio, 456 - Rio de Janeiro/RJ",
            "cargo": "Analista de Suporte",
            "departamento": "TI",
            "data_admissao": "2023-06-01",
            "salario": 5000.00,
            "status": "ATIVO"
        }
    ]

    ids_criados = []
    for colab in colaboradores:
        try:
            response = requests.post(
                f"{API_URL}/employees",
                headers=headers,
                json=colab
            )
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✅ Colaborador criado: {colab['nome_completo']}")
                ids_criados.append(data.get('id'))
            else:
                print(f"❌ Erro ao criar {colab['nome_completo']}: {response.text}")
        except Exception as e:
            print(f"❌ Exceção ao criar {colab['nome_completo']}: {e}")

    return ids_criados


# Criar conhecimentos
def criar_conhecimentos(token):
    headers = {"Authorization": f"Bearer {token}"}

    conhecimentos = [
        {
            "nome": "Python Avançado",
            "descricao": "Programação Python para desenvolvimento de aplicações complexas",
            "tipo": "TECNICO",
            "nivel_minimo": "INTERMEDIARIO",
            "categoria": "Programação",
            "carga_horaria": 40,
            "validade_meses": 24
        },
        {
            "nome": "AWS Solutions Architect",
            "descricao": "Certificação AWS para arquitetura de soluções em nuvem",
            "tipo": "CERTIFICACAO",
            "nivel_minimo": "AVANCADO",
            "categoria": "Cloud Computing",
            "carga_horaria": 80,
            "validade_meses": 36
        },
        {
            "nome": "Scrum Master Certified",
            "descricao": "Certificação em metodologias ágeis Scrum",
            "tipo": "METODOLOGIA",
            "nivel_minimo": "INTERMEDIARIO",
            "categoria": "Gestão de Projetos",
            "carga_horaria": 16,
            "validade_meses": 24
        },
        {
            "nome": "Liderança e Gestão de Equipes",
            "descricao": "Desenvolvimento de habilidades de liderança",
            "tipo": "COMPORTAMENTAL",
            "nivel_minimo": "BASICO",
            "categoria": "Soft Skills",
            "carga_horaria": 24,
            "validade_meses": 0  # Não expira
        }
    ]

    ids_criados = []
    for conhec in conhecimentos:
        try:
            response = requests.post(
                f"{API_URL}/knowledge",
                headers=headers,
                json=conhec
            )
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✅ Conhecimento criado: {conhec['nome']}")
                ids_criados.append(data.get('id'))
            else:
                print(f"❌ Erro ao criar {conhec['nome']}: {response.text}")
        except Exception as e:
            print(f"❌ Exceção ao criar {conhec['nome']}: {e}")

    return ids_criados


# Criar vínculos (employee_knowledge)
def criar_vinculos(token, employee_ids, knowledge_ids):
    if not employee_ids or not knowledge_ids:
        print("⚠️ Sem IDs de colaboradores ou conhecimentos para vincular")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # João Silva - Python Avançado
    if len(employee_ids) > 0 and len(knowledge_ids) > 0:
        vinculos = [
            {
                "employee_id": employee_ids[0],
                "knowledge_id": knowledge_ids[0],
                "nivel_obtido": "AVANCADO",
                "data_obtencao": (date.today() - timedelta(days=180)).isoformat(),
                "data_validade": (date.today() + timedelta(days=550)).isoformat(),
                "status": "ATIVO"
            },
            # Maria Santos - Scrum Master
            {
                "employee_id": employee_ids[1] if len(employee_ids) > 1 else employee_ids[0],
                "knowledge_id": knowledge_ids[2] if len(knowledge_ids) > 2 else knowledge_ids[0],
                "nivel_obtido": "ESPECIALISTA",
                "data_obtencao": (date.today() - timedelta(days=365)).isoformat(),
                "data_validade": (date.today() + timedelta(days=365)).isoformat(),
                "status": "ATIVO"
            }
        ]

        for vinculo in vinculos:
            try:
                response = requests.post(
                    f"{API_URL}/employee-knowledge",
                    headers=headers,
                    json=vinculo
                )
                if response.status_code in [200, 201]:
                    print(f"✅ Vínculo criado: Employee {vinculo['employee_id']} - Knowledge {vinculo['knowledge_id']}")
                else:
                    print(f"❌ Erro ao criar vínculo: {response.text}")
            except Exception as e:
                print(f"❌ Exceção ao criar vínculo: {e}")


def main():
    print("=" * 60)
    print("🌱 SEED DATA - Populando banco com dados de teste")
    print("=" * 60)

    # 1. Login
    print("\n1️⃣ Fazendo login como admin...")
    token = login_admin()
    if not token:
        print("❌ Falha no login. Encerrando.")
        return
    print(f"✅ Login realizado! Token: {token[:20]}...")

    # 2. Criar colaboradores
    print("\n2️⃣ Criando colaboradores...")
    employee_ids = criar_colaboradores(token)
    print(f"✅ {len(employee_ids)} colaboradores criados")

    # 3. Criar conhecimentos
    print("\n3️⃣ Criando conhecimentos...")
    knowledge_ids = criar_conhecimentos(token)
    print(f"✅ {len(knowledge_ids)} conhecimentos criados")

    # 4. Criar vínculos
    print("\n4️⃣ Criando vínculos...")
    criar_vinculos(token, employee_ids, knowledge_ids)

    print("\n" + "=" * 60)
    print("🎉 SEED DATA CONCLUÍDO!")
    print("=" * 60)
    print("\n📊 Resumo:")
    print(f"   • Colaboradores: {len(employee_ids)}")
    print(f"   • Conhecimentos: {len(knowledge_ids)}")
    print("\n🔗 Acesse:")
    print(f"   • Colaboradores: {API_URL}/employees")
    print(f"   • Conhecimentos: {API_URL}/knowledge")
    print(f"   • Vínculos: {API_URL}/employee-knowledge")
    print(f"   • Docs: {API_URL}/docs")


if __name__ == "__main__":
    main()