import sys
import os

# Ajustar sys.path para encontrar o pacote app a partir da raiz do projeto
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))

from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def reset_users():
    db = SessionLocal()
    try:
        # Apagar todos os usuários atuais
        db.query(User).delete()
        db.commit()
        print("Usuários antigos apagados")

        # Usuários a criar
        users = [
            {"username": "admin@ol360.com", "email": "admin@ol360.com", "password": "Admin@123456", "role": "admin", "is_admin": True},
            {"username": "diretoria@ol360.com", "email": "diretoria@ol360.com", "password": "Diretoria@123", "role": "diretoria", "is_admin": False},
            {"username": "gerente1@ol360.com", "email": "gerente1@ol360.com", "password": "Gerente@123", "role": "gerente", "is_admin": False},
            {"username": "colaborador1@ol360.com", "email": "colaborador1@ol360.com", "password": "Colab@123", "role": "colaborador", "is_admin": False},
        ]

        for u in users:
            hashed = hash_password(u["password"])
            user = User(
                username=u["username"],
                email=u["email"],
                hashed_password=hashed,
                role=u["role"],
                is_active=True,
                is_admin=u["is_admin"]
            )
            db.add(user)

        db.commit()
        print("Usuários criados com sucesso")
    finally:
        db.close()

if __name__ == "__main__":
    reset_users()
