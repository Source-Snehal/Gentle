import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class MoodCheckinRequest(BaseModel):
    energy: int = Field(..., ge=0, le=4, description="Energy level from 0 to 4")
    emotion: Literal['calm', 'anxious', 'tired', 'energized', 'low', 'mixed']
    note: str | None = Field(None, description="Optional note about the mood")


class MoodResponse(BaseModel):
    id: uuid.UUID
    created_at: datetime


class TinyStepResponse(BaseModel):
    step_id: uuid.UUID
    content: str
    rationale: str = Field(..., description="Why this step is tiny and achievable")