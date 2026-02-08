from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.product_log import ProductLog
from app.schemas.product_log import ProductLog as ProductLogSchema, ProductLogCreate

router = APIRouter()

@router.get("/", response_model=List[ProductLogSchema])
def read_product_logs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(ProductLog).offset(skip).limit(limit).all()

@router.post("/", response_model=ProductLogSchema)
def create_product_log(
    *,
    db: Session = Depends(deps.get_db),
    log_in: ProductLogCreate,
) -> Any:
    log = ProductLog(**log_in.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
