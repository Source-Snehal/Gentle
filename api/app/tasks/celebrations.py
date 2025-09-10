import logging

from celery import Celery

from app.core.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

celery_app = Celery(
    "gentle",
    broker=settings.redis_url,
    backend=settings.redis_url,
)


@celery_app.task
def send_celebration(user_id: str, step_id: str, kind: str) -> None:
    """Send a celebration for completed step.
    
    Currently a placeholder that logs the celebration.
    Future implementations could send emails, push notifications, etc.
    """
    logger.info(
        f"🎉 Celebration triggered for user {user_id}, step {step_id}, kind: {kind}"
    )
    
    # Placeholder implementation - just log for now
    # Future: send email via Resend, push notification, etc.
    
    return None