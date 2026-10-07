from fastapi import APIRouter

router = APIRouter(tags=["health"])

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.get("/api/health")
def health_check_api():
    return {"status": "ok"}

