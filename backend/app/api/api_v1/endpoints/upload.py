from typing import Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.api import deps
from app.models.user import User
import shutil
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "backend/static/uploads"

@router.post("/image", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload an image file.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Ensure upload directory exists
    # We need to resolve the path relative to the project root
    # Assuming start execution from backend or project root, careful with paths
    # Better to use absolute path based on app location
    
    # Base dir: backend/
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    upload_path = os.path.join(base_dir, "static", "uploads")
    
    os.makedirs(upload_path, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_location = os.path.join(upload_path, filename)
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/assets/uploads/{filename}"}
