"""
Testa conexão com o banco de dados
"""
import os
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

print("=" * 60)
print("🔍 TESTANDO VARIÁVEIS DE AMBIENTE")
print("=" * 60)

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"\n📊 DATABASE_URL encontrada: {DATABASE_URL is not None}")

if DATABASE_URL:
    # Mascarar senha na exibição
    masked_url = DATABASE_URL.split('@')[0].split(':')[:-1]
    masked_url = ':'.join(masked_url) + ':***@' + DATABASE_URL.split('@')[1]
    print(f"   URL: {masked_url}")
else:
    print("   ❌ DATABASE_URL não encontrada no .env!")

print("\n" + "=" * 60)
print("🔌 TESTANDO CONEXÃO COM SQLALCHEMY")
print("=" * 60)

try:
    from sqlalchemy import create_engine, text

    if not DATABASE_URL:
        print("❌ Não é possível testar sem DATABASE_URL")
        exit(1)

    # Criar engine
    engine = create_engine(DATABASE_URL, echo=False)

    # Testar conexão
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print(f"\n✅ CONEXÃO BEM-SUCEDIDA!")
        print(f"   PostgreSQL: {version.split(',')[0]}")

        # Testar query de usuários
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        count = result.fetchone()[0]
        print(f"\n👥 Usuários no banco: {count}")

        # Listar usuários
        if count > 0:
            result = conn.execute(text("SELECT email, role, is_active FROM users"))
            print("\n📋 Usuários encontrados:")
            for row in result:
                print(f"   - {row[0]} (Role: {row[1]}, Ativo: {row[2]})")

except Exception as e:
    print(f"\n❌ ERRO DE CONEXÃO!")
    print(f"   Detalhes: {e}")
    print("\n💡 Possíveis causas:")
    print("   1. Senha incorreta no .env")
    print("   2. Projeto Supabase pausado")
    print("   3. Firewall bloqueando porta 6543")
    print("   4. DATABASE_URL com formato incorreto")

    exit(1)

print("\n" + "=" * 60)
print("✅ TUDO OK! Agora pode rodar o script de reset de senha")
print("=" * 60)