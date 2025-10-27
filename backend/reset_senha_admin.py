"""
Script para resetar a senha do usuário admin
"""
import bcrypt
from app.database import SessionLocal
from app.models.user import User

def hash_password_bcrypt(password: str) -> str:
    """Hash usando bcrypt diretamente"""
    # Truncar para 72 bytes
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]

    # Gerar salt e hash
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def reset_admin_password():
    """Reseta a senha do admin para 'admin123'"""

    new_password = "admin123"
    admin_email = "admin@ol360.com"

    db = SessionLocal()

    try:
        # Busca o usuário admin
        user = db.query(User).filter(User.email == admin_email).first()

        if not user:
            print(f"❌ Usuário {admin_email} não encontrado!")
            print("\n💡 Criando usuário admin...")

            from app.models.user import UserRole
            admin_user = User(
                email=admin_email,
                hashed_password=hash_password_bcrypt(new_password),
                full_name="Administrador",
                role=UserRole.ADMIN_GESTAO,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            print(f"✅ Usuário admin criado!")
            print(f"   📧 Email: {admin_email}")
            print(f"   🔑 Senha: {new_password}")
            return

        # Atualiza a senha
        print(f"👤 Usuário encontrado: {user.email}")
        user.hashed_password = hash_password_bcrypt(new_password)
        db.commit()

        print(f"\n✅ Senha resetada!")
        print(f"   📧 Email: {admin_email}")
        print(f"   🔑 Senha: {new_password}")

    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()