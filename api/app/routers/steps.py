import uuid
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Step, Task, Celebration
from app.db.session import get_session
from app.deps.auth import UserCtx, get_current_user
from app.schemas.steps import StepResponse
from app.services.ai import rebalance_too_big
from app.tasks.celebrations import send_celebration

router = APIRouter()


@router.post("/{step_id}/complete")
async def complete_step(
    step_id: uuid.UUID,
    current_user: Annotated[UserCtx, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Mark a step as complete and trigger celebration."""
    
    # Get step and verify ownership through task
    step_result = await session.execute(
        select(Step, Task).join(Task).where(
            Step.id == step_id,
            Task.user_id == uuid.UUID(current_user.user_id)
        )
    )
    result = step_result.first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Step not found")
    
    step, task = result
    
    # Mark step as done
    step.state = "done"
    
    # Create celebration record
    celebration = Celebration(
        user_id=uuid.UUID(current_user.user_id),
        step_id=step.id,
        kind="confetti"
    )
    session.add(celebration)
    
    # Check if all steps in task are done
    remaining_steps_result = await session.execute(
        select(func.count(Step.id)).where(
            Step.task_id == task.id,
            Step.state == "pending"
        )
    )
    remaining_count = remaining_steps_result.scalar()
    
    task_completed = False
    if remaining_count == 0:
        task.state = "done"
        task_completed = True
    
    await session.commit()
    
    # Enqueue celebration task
    send_celebration.delay(
        user_id=current_user.user_id,
        step_id=str(step.id),
        kind="confetti"
    )
    
    return {
        "kind": "confetti",
        "message": "You did it! 🎉",
        "taskCompleted": task_completed
    }


@router.post("/{step_id}/too-big", response_model=List[StepResponse])
async def rebalance_step(
    step_id: uuid.UUID,
    current_user: Annotated[UserCtx, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Break down a step that feels too big into smaller sub-steps."""
    
    # Get step and verify ownership through task
    step_result = await session.execute(
        select(Step, Task).join(Task).where(
            Step.id == step_id,
            Task.user_id == uuid.UUID(current_user.user_id)
        )
    )
    result = step_result.first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Step not found")
    
    step, task = result
    
    # Generate smaller steps using AI
    ai_steps = await rebalance_too_big(step.content)
    
    # Get the next order number (after the current step)
    next_order_result = await session.execute(
        select(func.max(Step.order)).where(Step.task_id == task.id)
    )
    max_order = next_order_result.scalar() or 0
    
    # Create new sub-steps
    created_steps = []
    for i, ai_step in enumerate(ai_steps):
        new_step = Step(
            task_id=task.id,
            content=ai_step["content"],
            order=max_order + i + 1,
            state="pending"
        )
        session.add(new_step)
        created_steps.append(new_step)
    
    await session.commit()
    
    # Refresh to get all fields
    for new_step in created_steps:
        await session.refresh(new_step)
    
    return [
        StepResponse(
            id=new_step.id,
            task_id=new_step.task_id,
            content=new_step.content,
            order=new_step.order,
            state=new_step.state,
            created_at=new_step.created_at
        )
        for new_step in created_steps
    ]


# Example curls:
#
# Complete step:
# curl -X POST "http://localhost:8000/v1/steps/123e4567-e89b-12d3-a456-426614174000/complete" \
#   -H "Authorization: Bearer <your-jwt-token>"
#
# Break down too-big step:
# curl -X POST "http://localhost:8000/v1/steps/123e4567-e89b-12d3-a456-426614174000/too-big" \
#   -H "Authorization: Bearer <your-jwt-token>"