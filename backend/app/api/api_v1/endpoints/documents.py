from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.document import Document
from app.schemas.document import Document as DocumentSchema, DocumentCreate, DocumentUpdate

router = APIRouter()

@router.get("/", response_model=List[DocumentSchema])
def read_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    project_id: int = None,
) -> Any:
    query = db.query(Document)
    if project_id:
        query = query.filter(Document.project_id == project_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=DocumentSchema)
def create_document(
    *,
    db: Session = Depends(deps.get_db),
    doc_in: DocumentCreate,
) -> Any:
    doc = Document(**doc_in.dict())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.put("/{id}", response_model=DocumentSchema)
def update_document(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    doc_in: DocumentUpdate,
) -> Any:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    update_data = doc_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doc, field, value)
    db.add(doc)
    db.commit()
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{id}", response_model=DocumentSchema)
def delete_document(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return doc
