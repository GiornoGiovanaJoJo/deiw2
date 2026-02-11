from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.site_content import SiteContent
from app.schemas.site_content import SiteContentCreate, SiteContentUpdate, SiteContent as SiteContentSchema
from typing import List

router = APIRouter()

@router.get("/{key}", response_model=SiteContentSchema)
def read_content(key: str, db: Session = Depends(deps.get_db)):
    content = db.query(SiteContent).filter(SiteContent.key == key).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.put("/{key}", response_model=SiteContentSchema)
def update_content(
    key: str,
    content_in: SiteContentUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user) # Require auth
):
    if not current_user.is_superuser and current_user.role not in ["Admin"]:
         raise HTTPException(status_code=403, detail="Not enough permissions")

    content = db.query(SiteContent).filter(SiteContent.key == key).first()
    if not content:
        # Create if not exists
        content = SiteContent(key=key, content=content_in.content)
        db.add(content)
        db.commit()
        db.refresh(content)
    else:
        content.content = content_in.content
        db.add(content)
        db.commit()
        db.refresh(content)
    return content

@router.get("/", response_model=List[SiteContentSchema])
def read_all_content(db: Session = Depends(deps.get_db)):
    return db.query(SiteContent).all()
