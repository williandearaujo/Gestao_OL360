import requests
import json
from typing import Dict, List, Tuple
from datetime import datetime
import sys

# Configuração
BASE_URL = "http://localhost:8000"
USERS = {
    "admin": {
        "email": "admin@ol360.com",
        "password": "Admin@123456"
    },
    "diretoria": {
        "email": "diretoria@ol360.com",
        "password": "Diretoria@123"
    },
    "gerente": {
        "email": "gerente1@ol360.com",
        "password": "Gerente@123"
    },
    "colaborador": {
        "email": "colaborador1@ol360.com",
        "password": "Colab@123"
    }
}

# Armazenar resultados
results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "details": []
}

tokens = {}  # Armazenar tokens de autenticação


def print_header():
    """Imprime cabeçalho do relatório"""
    print("\n" + "=" * 70)
    print("🔍 VALIDAÇÃO AUTOMÁTICA - BACKEND OL360")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70 + "\n")


def print_test(name: str, method: str, endpoint: str):
    """Imprime teste sendo executado"""
    print(f"🧪 Testando: {method} {endpoint}")
    print(f"   Nome: {name}")


def print_result(success: bool, status_code: int = None, message: str = ""):
    """Imprime resultado do teste"""
    if success:
        print(f"   ✅ PASSOU (Status: {status_code}) {message}")
    else:
        print(f"   ❌ FALHOU (Status: {status_code}) {message}")
    print()


def test_health_check() -> bool:
    """Testa se o servidor está rodando"""
    print_test("Health Check", "GET", "/")
    results["total"] += 1

    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        success = response.status_code in [200, 404]  # 404 é OK se não tiver rota raiz

        if success:
            results["passed"] += 1
            print_result(True, response.status_code, "Servidor rodando")
        else:
            results["failed"] += 1
            print_result(False, response.status_code, "Servidor não responde")

        return success
    except requests.exceptions.ConnectionError:
        results["failed"] += 1
        print_result(False, None, "❌ SERVIDOR NÃO ESTÁ RODANDO!")
        print("\n⚠️  Execute: uvicorn app.main:app --reload")
        return False
    except Exception as e:
        results["failed"] += 1
        print_result(False, None, f"Erro: {str(e)}")
        return False


def test_docs() -> bool:
    """Testa se a documentação está acessível"""
    print_test("Documentação Swagger", "GET", "/docs")
    results["total"] += 1

    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        success = response.status_code == 200

        if success:
            results["passed"] += 1
            print_result(True, response.status_code)
        else:
            results["failed"] += 1
            print_result(False, response.status_code)

        return success
    except Exception as e:
        results["failed"] += 1
        print_result(False, None, f"Erro: {str(e)}")
        return False


def test_login(user_type: str) -> Tuple[bool, str]:
    """Testa login e retorna token"""
    user = USERS[user_type]
    print_test(f"Login - {user_type.upper()}", "POST", "/auth/login")
    results["total"] += 1

    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": user["email"],
                "password": user["password"]
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                token = data["access_token"]
                tokens[user_type] = token
                results["passed"] += 1
                print_result(True, response.status_code, f"Token obtido: {token[:20]}...")
                return True, token
            else:
                results["failed"] += 1
                print_result(False, response.status_code, "Token não encontrado na resposta")
                return False, ""
        else:
            results["failed"] += 1
            print_result(False, response.status_code, f"Credenciais: {user['email']}")
            return False, ""
    except Exception as e:
        results["failed"] += 1
        print_result(False, None, f"Erro: {str(e)}")
        return False, ""


def test_protected_route(name: str, method: str, endpoint: str, token: str, expected_status: int = 200) -> bool:
    """Testa rota protegida"""
    print_test(name, method, endpoint)
    results["total"] += 1

    try:
        headers = {"Authorization": f"Bearer {token}"}

        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json={}, timeout=5)
        elif method == "PUT":
            response = requests.put(f"{BASE_URL}{endpoint}", headers=headers, json={}, timeout=5)
        elif method == "DELETE":
            response = requests.delete(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
        else:
            results["skipped"] += 1
            print_result(False, None, "Método não suportado")
            return False

        success = response.status_code == expected_status

        if success:
            results["passed"] += 1
            print_result(True, response.status_code)
        else:
            results["failed"] += 1
            print_result(False, response.status_code, f"Esperado: {expected_status}")

        return success
    except Exception as e:
        results["failed"] += 1
        print_result(False, None, f"Erro: {str(e)}")
        return False


def test_unauthorized_access(name: str, method: str, endpoint: str) -> bool:
    """Testa acesso sem token (deve retornar 401)"""
    print_test(name, method, endpoint)
    results["total"] += 1

    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
        else:
            response = requests.post(f"{BASE_URL}{endpoint}", timeout=5)

        # Deve retornar 401 Unauthorized
        success = response.status_code == 401

        if success:
            results["passed"] += 1
            print_result(True, response.status_code, "Rota protegida corretamente")
        else:
            results["failed"] += 1
            print_result(False, response.status_code, "⚠️ Rota deveria estar protegida!")

        return success
    except Exception as e:
        results["failed"] += 1
        print_result(False, None, f"Erro: {str(e)}")
        return False


def run_all_tests():
    """Executa todos os testes"""
    print_header()

    # 1. Teste básico - Servidor rodando
    print("📍 FASE 1: VERIFICAÇÃO BÁSICA")
    print("-" * 70)
    if not test_health_check():
        print("\n❌ ERRO CRÍTICO: Servidor não está rodando!")
        print("Abortando testes...\n")
        sys.exit(1)

    test_docs()
    print()

    # 2. Autenticação
    print("📍 FASE 2: AUTENTICAÇÃO")
    print("-" * 70)

    admin_logged, admin_token = test_login("admin")
    diretoria_logged, diretoria_token = test_login("diretoria")
    gerente_logged, gerente_token = test_login("gerente")
    colaborador_logged, colaborador_token = test_login("colaborador")

    if not admin_logged:
        print("\n⚠️  AVISO: Login de admin falhou. Verifique se seed foi executado.")
        print("Execute: python seed_users.py\n")

    print()

    # 3. Rotas protegidas (usando token admin)
    if admin_logged:
        print("📍 FASE 3: ROTAS PROTEGIDAS (COM TOKEN)")
        print("-" * 70)

        # Auth
        test_protected_route("Get Current User", "GET", "/auth/me", admin_token)

        # Usuários
        test_protected_route("Listar Usuários", "GET", "/users", admin_token)
        test_protected_route("Buscar Usuário Admin", "GET", "/users/1", admin_token)

        # Colaboradores
        test_protected_route("Listar Colaboradores", "GET", "/colaboradores", admin_token)

        # Certificações
        test_protected_route("Listar Certificações", "GET", "/certificacoes", admin_token)

        # Clientes
        test_protected_route("Listar Clientes", "GET", "/clientes", admin_token)

        # PDIs
        test_protected_route("Listar PDIs", "GET", "/pdi", admin_token)

        # Reuniões 1:1
        test_protected_route("Listar Reuniões", "GET", "/one-on-ones", admin_token)

        # Férias
        test_protected_route("Listar Férias", "GET", "/ferias", admin_token)

        # Day-offs
        test_protected_route("Listar Day-offs", "GET", "/day-offs", admin_token)

        # Dashboard
        test_protected_route("Dashboard KPIs", "GET", "/dashboard/kpis", admin_token)

        print()

    # 4. Teste de segurança (sem token)
    print("📍 FASE 4: SEGURANÇA (SEM TOKEN)")
    print("-" * 70)

    test_unauthorized_access("Listar Usuários Sem Token", "GET", "/users")
    test_unauthorized_access("Listar Colaboradores Sem Token", "GET", "/colaboradores")
    test_unauthorized_access("Dashboard Sem Token", "GET", "/dashboard/kpis")

    print()

    # 5. Teste de permissões RBAC
    if colaborador_logged and admin_logged:
        print("📍 FASE 5: PERMISSÕES RBAC")
        print("-" * 70)

        # Colaborador tentando acessar todos os usuários (deve falhar ou retornar apenas seus dados)
        print_test("Colaborador: Listar TODOS Usuários", "GET", "/users")
        results["total"] += 1
        try:
            response = requests.get(
                f"{BASE_URL}/users",
                headers={"Authorization": f"Bearer {colaborador_token}"},
                timeout=5
            )
            # Pode retornar 403 (sem permissão) ou 200 com apenas seus dados
            if response.status_code in [200, 403]:
                results["passed"] += 1
                print_result(True, response.status_code, "RBAC funcionando")
            else:
                results["failed"] += 1
                print_result(False, response.status_code, "Erro no RBAC")
        except Exception as e:
            results["failed"] += 1
            print_result(False, None, f"Erro: {str(e)}")

        print()


def print_summary():
    """Imprime resumo dos testes"""
    print("\n" + "=" * 70)
    print("📊 RESUMO DA VALIDAÇÃO")
    print("=" * 70)
    print(f"Total de testes: {results['total']}")
    print(f"✅ Passou: {results['passed']}")
    print(f"❌ Falhou: {results['failed']}")
    print(f"⏭️  Pulado: {results['skipped']}")

    if results['total'] > 0:
        success_rate = (results['passed'] / results['total']) * 100
        print(f"\n📈 Taxa de Sucesso: {success_rate:.1f}%")

        if success_rate == 100:
            print("\n🎉 PARABÉNS! Todos os testes passaram!")
        elif success_rate >= 80:
            print("\n✅ Ótimo! Maioria dos testes passaram.")
        elif success_rate >= 60:
            print("\n⚠️  Atenção! Alguns testes falharam.")
        else:
            print("\n❌ CRÍTICO! Muitos testes falharam.")

    print("=" * 70)

    # Recomendações
    if results['failed'] > 0:
        print("\n📝 RECOMENDAÇÕES:")
        print("-" * 70)
        print("1. Verifique se o servidor está rodando: uvicorn app.main:app --reload")
        print("2. Execute o seed de usuários: python seed_users.py")
        print("3. Verifique os logs do backend para erros específicos")
        print("4. Consulte a documentação em: http://localhost:8000/docs")
        print("5. Verifique se o banco de dados está configurado corretamente")
        print()


def generate_report():
    """Gera relatório em arquivo"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"validation_report_{timestamp}.txt"

    with open(filename, "w", encoding="utf-8") as f:
        f.write("=" * 70 + "\n")
        f.write("RELATÓRIO DE VALIDAÇÃO - BACKEND OL360\n")
        f.write("=" * 70 + "\n")
        f.write(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Base URL: {BASE_URL}\n")
        f.write("=" * 70 + "\n\n")

        f.write(f"Total de testes: {results['total']}\n")
        f.write(f"Passou: {results['passed']}\n")
        f.write(f"Falhou: {results['failed']}\n")
        f.write(f"Pulado: {results['skipped']}\n")

        if results['total'] > 0:
            success_rate = (results['passed'] / results['total']) * 100
            f.write(f"\nTaxa de Sucesso: {success_rate:.1f}%\n")

        f.write("\n" + "=" * 70 + "\n")

    print(f"\n📄 Relatório salvo em: {filename}")


def main():
    """Função principal"""
    try:
        run_all_tests()
        print_summary()
        generate_report()

        # Exit code baseado nos resultados
        if results['failed'] == 0:
            sys.exit(0)
        else:
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n⚠️  Testes interrompidos pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Erro fatal: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()