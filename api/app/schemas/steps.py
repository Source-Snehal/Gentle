import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TinyStepResponse(BaseModel):
    step_id: uuid.UUID
    content: str
    rationale: str = Field(..., description="Why this step is tiny and achievable")


class StepResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    content: str
    order: int
    state: Literal['pending', 'done']
    created_at: datetime