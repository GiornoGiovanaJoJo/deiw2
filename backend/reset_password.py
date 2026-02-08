
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.api import deps
from app.core import security
from app.models.user import User
from app.models.task import Aufgabe
from app.models.project import Projekt

# Adjust DB URL if needed
SQLALCHEMY_DATABASE_URI = "sqlite:///./sql_app.db"

engine = create_engine(SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def reset_password(email, new_password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found!")
            return

        print(f"Found user {user.email} (ID: {user.id})")
        user.hashed_password = security.get_password_hash(new_password)
        user.role = "Admin"
        user.is_superuser = True
        
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"SUCCESS: Password reset to '{new_password}' and role set to 'Admin' for {email}")
            
    except Exception as e:
        print(f"Error resetting password: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_password("granpainside@yandex.ru", "12345678")
