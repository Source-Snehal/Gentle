from celery import Celery

from app.core.settings import get_settings

settings = get_settings()

celery_app = Celery(
    "gentle",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,
)

celery_app.autodiscover_tasks(["app.tasks"])