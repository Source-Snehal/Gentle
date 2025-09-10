import uuid
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Task, Step, User
from app.db.session import get_session
from app.deps.auth import UserCtx, get_current_user
from app.schemas.tasks import TaskCreateRequest, TaskResponse, TaskListItem, TaskDetailResponse
from app.schemas.steps import StepResponse
from app.services.ai import breakdown_task

router = APIRouter()


@router.get("", response_model=List[TaskListItem])
async def get_tasks(
    current_user: Annotated[UserCtx, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Get all tasks for the current user, ordered by created_at desc."""
    
    # Get tasks for current user
    tasks_result = await session.execute(
        select(Task)
        .where(Task.user_id == uuid.UUID(current_user.user_id))
        .order_by(Task.created_at.desc())
    )
    tasks = tasks_result.scalars().all()
    
    return [
        TaskListItem(
            id=task.id,
            title=task.title,
            state=task.state,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
        for task in tasks
    ]


@router.get("/{task_id}", response_model=TaskDetailResponse)
async def get_task_detail(
    task_id: uuid.UUID,
    current_user: Annotated[UserCtx, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Get task details with steps, ordered by step order."""
    
    # Get task with steps and verify ownership
    task_result = await session.execute(
        select(Task)
        .options(selectinload(Task.steps))
        .where(
            Task.id == task_id,
            Task.user_id == uuid.UUID(current_user.user_id)
        )
    )
    task = task_result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Sort steps by order
    steps = sorted(task.steps, key=lambda s: s.order)
    
    return TaskDetailResponse(
        id=task.id,
        title=task.title,
        state=task.state,
        created_at=task.created_at,
        updated_at=task.updated_at,
        steps=[
            StepResponse(
                id=step.id,
                task_id=step.task_id,
                content=step.content,
                order=step.order,
                state=step.state,
                created_at=step.created_at
            )
            for step in steps
        ]
    )


@router.post("", response_model=TaskResponse)
async def create_task(
    request: TaskCreateRequest,
    current_user: Annotated[UserCtx, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Create a new task."""
    
    # Ensure user exists
    user_result = await session.execute(
        select(User).where(User.id == uuid.UUID(current_user.user_id))
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        # Create user if doesn't exist
        user = User(id=uuid.UUID(current_user.user_id))
        session.add(user)
    
    # Create task
    task = Task(
        user_id=uuid.UUID(current_user.user_id),
        title=request.title,
        state="pending"
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    
    return TaskResponse(
        id=task.id,
        title=task.title,
        state=task.state,
        created_at=task.created_at,
        updated_at=task.updated_at
    )


@router.post("/{task_id}/breakdown", response_model=List[StepResponse])
async def breakdown_task_endpoint(
    task_id: uuid.UUID,
    current_user: Annotated[UserCtx, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    energy: int = None,
    emotion: str = None
):
    """Break down a task into smaller steps."""
    
    # Get task and verify ownership
    task_result = await session.execute(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == uuid.UUID(current_user.user_id)
        )
    )
    task = task_result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Generate step breakdown using AI
    ai_steps = await breakdown_task(task.title, energy=energy, emotion=emotion)
    
    # Create steps in database
    created_steps = []
    for i, ai_step in enumerate(ai_steps, 1):
        step = Step(
            task_id=task.id,
            content=ai_step["content"],
            order=i,
            state="pending"
        )
        session.add(step)
        created_steps.append(step)
    
    await session.commit()
    
    # Refresh to get all fields
    for step in created_steps:
        await session.refresh(step)
    
    return [
        StepResponse(
            id=step.id,
            task_id=step.task_id,
            content=step.content,
            order=step.order,
            state=step.state,
            created_at=step.created_at
        )
        for step in created_steps
    ]


# Example curls:
# 
# Get all tasks:
# curl -X GET "http://localhost:8000/v1/tasks" \
#   -H "Authorization: Bearer <your-jwt-token>"
#
# Get task detail:
# curl -X GET "http://localhost:8000/v1/tasks/123e4567-e89b-12d3-a456-426614174000" \
#   -H "Authorization: Bearer <your-jwt-token>"
#
# Create task:
# curl -X POST "http://localhost:8000/v1/tasks" \
#   -H "Authorization: Bearer <your-jwt-token>" \
#   -H "Content-Type: application/json" \
#   -d '{"title": "Organize my workspace"}'
#
# Breakdown task:
# curl -X POST "http://localhost:8000/v1/tasks/123e4567-e89b-12d3-a456-426614174000/breakdown" \
#   -H "Authorization: Bearer <your-jwt-token>"