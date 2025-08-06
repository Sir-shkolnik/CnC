from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/")
async def get_endpoint() -> Dict[str, Any]:
    return {"success": True, "message": "audit placeholder"}
