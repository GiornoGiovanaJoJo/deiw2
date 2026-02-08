from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    PROJECT_NAME: str = "deiw2.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY" # In production, this should be an env var
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # Database
    SQLALCHEMY_DATABASE_URI: Optional[str] = "sqlite:///./sql_app.db"
    
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"] # React dev server
    USERS_OPEN_REGISTRATION: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
