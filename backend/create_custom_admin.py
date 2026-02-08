import sys
import os
import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend imports work
current_file = Path(__file__).resolve()
backend_dir = current_file.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Try importing app modules
try:
    from app.core.config import settings
    from app.core.security import get_password_hash
    from app.db.session import SessionLocal
    from app.models.user import User
except ImportError as e:
    print(f"Error importing app modules: {e}")
    # Fallback to parent dir if needed (for some environments)
    sys.path.insert(0, str(backend_dir.parent))
    from backend.app.core.config import settings
    from backend.app.core.security import get_password_hash
    from backend.app.db.session import SessionLocal
    from backend.app.models.user import User

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_or_update_admin():
    target_email = "granpainside@yandex.ru"
    target_password = "Nikitoso02-"
    
    logger.info(f"Checking for admin user: {target_email}")
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == target_email).first()
        
        if user:
            logger.info("User exists. Updating permissions and password...")
            user.hashed_password = get_password_hash(target_password)
            user.is_superuser = True
            user.role = "Admin"
            user.is_active = True
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("User updated successfully.")
        else:
            logger.info("User does not exist. Creating new admin user...")
            new_user = User(
                email=target_email,
                hashed_password=get_password_hash(target_password),
                first_name="Admin",
                last_name="User",
                role="Admin",
                is_active=True,
                is_superuser=True,
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info("User created successfully.")
            
    except Exception as e:
        logger.error(f"Error creating/updating admin user: {e}")
        # Build might fail if DB connection fails, but often we want to catch this 
        # to avoid crashing the whole deploy process if it's transient. 
        # However, for this specific request, it's better to fail if we can't create the admin.
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    create_or_update_admin()
