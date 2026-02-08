from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_user), # Only authenticated users can create users for now? Or maybe open registration?
) -> Any:
    """
    Create new user.
    """
    # Check permissions - usually admin only, but for now allow any active user or remove dependency for open reg
    # Let's assume open registration is NOT the default for this system (it's enterprise), so maybe only admin.
    # But for development ease, I'll allow open registration on a separate endpoint or just here if I remove dependency.
    # Actually, let's make this an admin-only endpoint effectively, and add a open registration if needed.
    # For now, I'll restrict it. To create the FIRST user (admin), we'll use a script.
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        role=user_in.role,
        is_superuser=user_in.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/open", response_model=UserSchema)
def create_user_open(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user without logged in.
    """
    if not settings.USERS_OPEN_REGISTRATION:
        raise HTTPException(
            status_code=403,
            detail="Open user registration is forbidden on this server",
        )
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        role="Worker", # Default role
        is_superuser=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    if user_in.password:
        current_user.hashed_password = security.get_password_hash(user_in.password)
    if user_in.email:
        current_user.email = user_in.email
    if user_in.first_name:
        current_user.first_name = user_in.first_name
    if user_in.last_name:
        current_user.last_name = user_in.last_name
    
    # Only allow updating sensitive fields if not self-update or check elsewhere (this endpoint is "me")
    # Wait, the prompt says "allow Admin to update user roles".
    # The /me endpoint is for the user to update themselves.
    # User should NOT be able to change their own role via /me typically.
    # I need a separate endpoint for Admin to update ANY user, including roles.
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a user. Admin only.
    """
    if not current_user.is_superuser and current_user.role != "Admin":
         raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
        
    if user_in.password:
        user.hashed_password = security.get_password_hash(user_in.password)
    if user_in.email:
        user.email = user_in.email
    if user_in.first_name:
        user.first_name = user_in.first_name
    if user_in.last_name:
        user.last_name = user_in.last_name
    if user_in.role:
        user.role = user_in.role
    if user_in.is_superuser is not None:
        user.is_superuser = user_in.is_superuser
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserSchema)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
