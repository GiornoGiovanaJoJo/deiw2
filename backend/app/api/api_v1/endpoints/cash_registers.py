from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.cash_register import CashRegister
from app.schemas.cash_register import CashRegister as CashRegisterSchema, CashRegisterCreate, CashRegisterUpdate

router = APIRouter()

@router.get("/", response_model=List[CashRegisterSchema])
def read_cash_registers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(CashRegister).offset(skip).limit(limit).all()

@router.post("/", response_model=CashRegisterSchema)
def create_cash_register(
    *,
    db: Session = Depends(deps.get_db),
    register_in: CashRegisterCreate,
) -> Any:
    register = CashRegister(**register_in.dict())
    db.add(register)
    db.commit()
    db.refresh(register)
    return register

@router.put("/{id}", response_model=CashRegisterSchema)
def update_cash_register(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    register_in: CashRegisterUpdate,
) -> Any:
    register = db.query(CashRegister).filter(CashRegister.id == id).first()
    if not register:
        raise HTTPException(status_code=404, detail="Cash register not found")
    update_data = register_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(register, field, value)
    db.add(register)
    db.commit()
    db.refresh(register)
    return register
