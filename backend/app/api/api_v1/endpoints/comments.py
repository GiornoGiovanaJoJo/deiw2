from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.comment import Comment
from app.schemas.comment import Comment as CommentSchema, CommentCreate

router = APIRouter()

@router.get("/", response_model=List[CommentSchema])
def read_comments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    entity_type: str = None,
    entity_id: str = None,
) -> Any:
    query = db.query(Comment)
    if entity_type:
        query = query.filter(Comment.entity_type == entity_type)
    if entity_id:
        query = query.filter(Comment.entity_id == entity_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=CommentSchema)
def create_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_in: CommentCreate,
) -> Any:
    comment = Comment(**comment_in.dict())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
