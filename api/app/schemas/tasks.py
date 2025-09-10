import uuid
from datetime import datetime
from typing import Literal, List

from pydantic import BaseModel, Field

from .steps import StepResponse


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, description="Task title")


class TaskResponse(BaseModel):
    id: uuid.UUID
    title: str
    state: Literal['pending', 'active', 'done', 'archived']
    created_at: datetime
    updated_at: datetime


class TaskListItem(BaseModel):
    id: uuid.UUID
    title: str
    state: Literal['pending', 'active', 'done', 'archived']
    created_at: datetime
    updated_at: datetime


class TaskDetailResponse(BaseModel):
    id: uuid.UUID
    title: str
    state: Literal['pending', 'active', 'done', 'archived']
    created_at: datetime
    updated_at: datetime
    steps: List[StepResponse]