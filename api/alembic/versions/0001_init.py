"""Initial migration

Revision ID: 0001_init
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_init'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM types - use create_drop=True to avoid conflicts
    emotion_enum = postgresql.ENUM('calm', 'anxious', 'tired', 'energized', 'low', 'mixed', name='emotion_enum', create_type=False)
    task_state_enum = postgresql.ENUM('pending', 'active', 'done', 'archived', name='task_state_enum', create_type=False)
    step_state_enum = postgresql.ENUM('pending', 'done', name='step_state_enum', create_type=False)
    celebration_kind_enum = postgresql.ENUM('confetti', 'breath', 'sound', name='celebration_kind_enum', create_type=False)
    
    # Explicitly create the enum types
    emotion_enum.create(op.get_bind(), checkfirst=True)
    task_state_enum.create(op.get_bind(), checkfirst=True)
    step_state_enum.create(op.get_bind(), checkfirst=True)
    celebration_kind_enum.create(op.get_bind(), checkfirst=True)
    
    # Create tables in FK order: users → moods/tasks → steps → celebrations/ai_sessions
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('moods',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('energy', sa.Integer(), nullable=False),
        sa.Column('emotion', emotion_enum, nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('state', task_state_enum, nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('steps',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.Column('state', step_state_enum, nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('celebrations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('step_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('kind', celebration_kind_enum, nullable=False, server_default='confetti'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['step_id'], ['steps.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('ai_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('input', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('output', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_moods_user_id', 'moods', ['user_id'])
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_steps_task_id', 'steps', ['task_id'])
    op.create_index('ix_celebrations_user_id', 'celebrations', ['user_id'])
    op.create_index('ix_ai_sessions_user_id', 'ai_sessions', ['user_id'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('ai_sessions')
    op.drop_table('celebrations')
    op.drop_table('steps')
    op.drop_table('tasks')
    op.drop_table('moods')
    op.drop_table('users')
    
    # Drop ENUM types
    op.execute('DROP TYPE IF EXISTS celebration_kind_enum')
    op.execute('DROP TYPE IF EXISTS step_state_enum')
    op.execute('DROP TYPE IF EXISTS task_state_enum')
    op.execute('DROP TYPE IF EXISTS emotion_enum')