from typing import Annotated

from fastapi import APIRouter, Depends

from app.deps.auth import UserCtx, get_current_user
from app.routers.tasks import router as tasks_router
from app.routers.mood import router as mood_router
from app.routers.steps import router as steps_router

router = APIRouter()

# Include routes
router.include_router(tasks_router, prefix="/tasks")
router.include_router(mood_router, prefix="/mood") 
router.include_router(steps_router, prefix="/steps")


@router.get("/ping")
async def ping(
    current_user: Annotated[UserCtx, Depends(get_current_user)]
):
    return {"pong": True, "user_id": current_user.user_id}


# Example curl:
# curl -X GET "http://localhost:8000/v1/ping" \
#   -H "Authorization: Bearer <your-jwt-token>"