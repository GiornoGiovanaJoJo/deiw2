import logging

from app.db.session import SessionLocal
from app.core import security
from app.models.user import User

from app.db.base import Base
from app.db.session import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: SessionLocal) -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Here we create the first superuser
    user = db.query(User).filter(User.email == "admin@example.com").first()
    if not user:
        user = User(
            email="admin@example.com",
            hashed_password=security.get_password_hash("admin"),
            first_name="Admin",
            last_name="User",
            role="Admin",
            is_superuser=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Superuser created")
    else:
        logger.info("Superuser already exists")

def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    init_db(db)
    logger.info("Initial data created")

if __name__ == "__main__":
    main()
