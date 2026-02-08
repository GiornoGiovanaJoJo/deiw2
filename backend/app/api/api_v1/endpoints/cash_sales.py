from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.cash_sale import CashSale
from app.schemas.cash_sale import CashSale as CashSaleSchema, CashSaleCreate

router = APIRouter()

@router.get("/", response_model=List[CashSaleSchema])
def read_cash_sales(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(CashSale).offset(skip).limit(limit).all()

@router.post("/", response_model=CashSaleSchema)
def create_cash_sale(
    *,
    db: Session = Depends(deps.get_db),
    sale_in: CashSaleCreate,
) -> Any:
    sale = CashSale(**sale_in.dict())
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale
