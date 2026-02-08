import sys
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the current directory to sys.path to ensure 'app' can be imported
# This allows running the script from 'backend/' directory
current_file = Path(__file__).resolve()
backend_dir = current_file.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

try:
    from app.core.config import settings
except ImportError:
    # Fallback if running from root
    sys.path.insert(0, str(backend_dir.parent))
    from backend.app.core.config import settings

def promote_user(email):
    print(f"Connecting to database (using app settings)...")
    
    # Establish connection
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user exists
        # We use raw SQL to avoid importing models and dealing with potential circular imports or missing deps
        print(f"Looking for user: {email}")
        result = db.execute(text("SELECT id FROM user WHERE email = :email"), {"email": email}).fetchone()
        
        if result:
            # Promote
            db.execute(text("UPDATE user SET is_superuser = 1, role = 'Admin' WHERE email = :email"), {"email": email})
            db.commit()
            print(f"Success: User {email} has been promoted to Admin and Superuser.")
        else:
            print(f"Error: User {email} not found in the database.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
        promote_user(email)
    else:
        print("Please provide an email address as an argument.")
        print(f"Usage: python {sys.argv[0]} <email>")
