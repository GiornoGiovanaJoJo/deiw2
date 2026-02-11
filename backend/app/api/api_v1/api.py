from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    login, users, projects, tasks, categories, customers,
    subcontractors, project_stages, documents, tickets, notes, comments, upload, messages, content
)


api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(product_logs.router, prefix="/product-logs", tags=["product-logs"])
api_router.include_router(time_entries.router, prefix="/time-entries", tags=["time-entries"])
api_router.include_router(cash_registers.router, prefix="/cash-registers", tags=["cash-registers"])
api_router.include_router(cash_sales.router, prefix="/cash-sales", tags=["cash-sales"])
api_router.include_router(subcontractors.router, prefix="/subcontractors", tags=["subcontractors"])
api_router.include_router(project_stages.router, prefix="/project-stages", tags=["project-stages"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(content.router, prefix="/content", tags=["content"])



