from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    print(f"DEBUG LOGIN START")
    print(f"Received username: {repr(form_data.username)}")
    print(f"Received password: {repr(form_data.password)}")
    
    user = db.query(User).filter(User.email == form_data.username).first()
    print(f"User found in DB: {user}")
    
    if user:
        is_password_correct = security.verify_password(form_data.password, user.hashed_password)
        print(f"Password verification result: {is_password_correct}")
        if not is_password_correct:
            print(f"Stored hash: {user.hashed_password}")
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        print("DEBUG LOGIN: Incorrect email or password")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        print("DEBUG LOGIN: Inactive user")
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
