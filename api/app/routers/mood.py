import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Mood, Task, Step, User
from app.db.session import get_session
from app.deps.auth import UserCtx, get_current_user
from app.schemas.mood import MoodCheckinRequest, MoodResponse
from app.schemas.steps import TinyStepResponse
from app.services.ai import generate_tiny_step_from_mood

router = APIRouter()


@router.post("/checkin", response_model=TinyStepResponse)
async def mood_checkin(
    request: MoodCheckinRequest,
    current_user: Annotated[UserCtx, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Check in mood and get a gentle, personalized tiny step."""
    
    # Ensure user exists
    user_result = await session.execute(
        select(User).where(User.id == uuid.UUID(current_user.user_id))
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        # Create user if doesn't exist
        user = User(id=uuid.UUID(current_user.user_id))
        session.add(user)
    
    # Create mood record
    mood = Mood(
        user_id=uuid.UUID(current_user.user_id),
        energy=request.energy,
        emotion=request.emotion,
        note=request.note
    )
    session.add(mood)
    
    # Generate AI-powered tiny step
    ai_response = await generate_tiny_step_from_mood(
        user_id=current_user.user_id,
        energy=request.energy,
        emotion=request.emotion,
        note=request.note
    )
    
    # Create transient task for mood-driven step
    task = Task(
        user_id=uuid.UUID(current_user.user_id),
        title=f"Gentle: mood-driven micro-step",
        state="active"
    )
    session.add(task)
    await session.flush()  # Get task ID
    
    # Create the step
    step = Step(
        task_id=task.id,
        content=ai_response["content"],
        order=1,
        state="pending"
    )
    session.add(step)
    await session.flush()  # Get step ID
    
    await session.commit()
    
    return TinyStepResponse(
        step_id=step.id,
        content=ai_response["content"],
        rationale=ai_response["rationale"]
    )


# Example curl:
# curl -X POST "http://localhost:8000/v1/mood/checkin" \
#   -H "Authorization: Bearer <your-jwt-token>" \
#   -H "Content-Type: application/json" \
#   -d '{"energy": 2, "emotion": "anxious", "note": "Feeling overwhelmed with work"}'