from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, Category as CategorySchema

router = APIRouter()

@router.get("/", response_model=List[CategorySchema])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve categories.
    """
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories

@router.get("/public", response_model=List[CategorySchema])
def read_public_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve categories for public access.
    """
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories

@router.post("/", response_model=CategorySchema)
def create_category(
    *,
    db: Session = Depends(deps.get_db),
    category_in: CategoryCreate,
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new category.
    """
    category = Category(
        name=category_in.name,
        description=category_in.description,
        parent_id=category_in.parent_id,
        type=category_in.type,
        color=category_in.color,
        icon_name=category_in.icon_name,
        image_url=category_in.image_url,
        custom_fields=category_in.custom_fields
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategorySchema)
def update_category(
    *,
    db: Session = Depends(deps.get_db),
    category_id: int,
    category_in: CategoryUpdate,
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a category.
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", response_model=CategorySchema)
def delete_category(
    *,
    db: Session = Depends(deps.get_db),
    category_id: int,
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a category.
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(category)
    db.commit()
    return category
