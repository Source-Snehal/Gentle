FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy application code first
COPY . .

# Install Python dependencies directly from pyproject.toml
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    "fastapi>=0.104.1" \
    "uvicorn[standard]>=0.24.0" \
    "pydantic>=2.0.0,<3.0.0" \
    "pydantic-settings>=2.0.0" \
    "httpx>=0.25.0" \
    "sqlalchemy>=2.0.0,<3.0.0" \
    "asyncpg>=0.29.0" \
    "psycopg2-binary>=2.9.0" \
    "redis>=5.0.0" \
    "celery>=5.3.0" \
    "python-dotenv>=1.0.0" \
    "sentry-sdk>=1.38.0" \
    "posthog>=3.0.0" \
    "python-jose[cryptography]>=3.3.0" \
    "cachetools>=5.3.0" \
    "alembic>=1.12.0" \
    "openai>=1.40.0"

# Expose port
EXPOSE 8000

# Default command (will be overridden by docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]