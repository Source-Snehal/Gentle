import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


emotion_enum = sa.Enum(
    'calm', 'anxious', 'tired', 'energized', 'low', 'mixed',
    name='emotion_enum'
)

task_state_enum = sa.Enum(
    'pending', 'active', 'done', 'archived',
    name='task_state_enum'
)

step_state_enum = sa.Enum(
    'pending', 'done',
    name='step_state_enum'
)

celebration_kind_enum = sa.Enum(
    'confetti', 'breath', 'sound',
    name='celebration_kind_enum'
)


class User(Base):
    __tablename__ = 'users'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    moods: Mapped[list["Mood"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[list["Task"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    celebrations: Mapped[list["Celebration"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    ai_sessions: Mapped[list["AISession"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Mood(Base):
    __tablename__ = 'moods'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    energy: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    emotion: Mapped[str] = mapped_column(emotion_enum, nullable=False)
    note: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), 
        server_default=sa.func.now(),
        nullable=False
    )
    
    user: Mapped["User"] = relationship(back_populates="moods")


class Task(Base):
    __tablename__ = 'tasks'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title: Mapped[str] = mapped_column(sa.Text, nullable=False)
    state: Mapped[str] = mapped_column(task_state_enum, default='pending', nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), 
        server_default=sa.func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), 
        server_default=sa.func.now(),
        server_onupdate=sa.func.now(),
        nullable=False
    )
    
    user: Mapped["User"] = relationship(back_populates="tasks")
    steps: Mapped[list["Step"]] = relationship(back_populates="task", cascade="all, delete-orphan")


class Step(Base):
    __tablename__ = 'steps'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)
    content: Mapped[str] = mapped_column(sa.Text, nullable=False)
    order: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    state: Mapped[str] = mapped_column(step_state_enum, default='pending', nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), 
        server_default=sa.func.now(),
        nullable=False
    )
    
    task: Mapped["Task"] = relationship(back_populates="steps")
    celebrations: Mapped[list["Celebration"]] = relationship(back_populates="step", cascade="all, delete-orphan")


class Celebration(Base):
    __tablename__ = 'celebrations'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    step_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey('steps.id', ondelete='SET NULL'), nullable=True)
    kind: Mapped[str] = mapped_column(celebration_kind_enum, default='confetti', nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), 
        server_default=sa.func.now(),
        nullable=False
    )
    
    user: Mapped["User"] = relationship(back_populates="celebrations")
    step: Mapped["Step | None"] = relationship(back_populates="celebrations")


class AISession(Base):
    __tablename__ = 'ai_sessions'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    input: Mapped[dict] = mapped_column(JSONB, nullable=False)
    output: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), 
        server_default=sa.func.now(),
        nullable=False
    )
    
    user: Mapped["User"] = relationship(back_populates="ai_sessions")