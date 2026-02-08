
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Adjust DB URL if needed
SQLALCHEMY_DATABASE_URI = "sqlite:///./sql_app.db"

engine = create_engine(SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_users():
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT id, email, is_active, is_superuser, role FROM user"))
        users = result.fetchall()
        print(f"Total Users found: {len(users)}")
        for u in users:
            print(f" - ID: {u.id}, Email: {u.email}, Role: {u.role}, Active: {u.is_active}")
            
    except Exception as e:
        print(f"Error querying users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
