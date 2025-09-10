# Gentle

An empathetic productivity companion that helps you take one step at a time.

## Quick Start

1. Copy environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

2. Start all services:
   ```bash
   docker-compose up
   ```

3. Services will be available at:
   - Web app: http://localhost:3000
   - API: http://localhost:8000
   - Database: localhost:5432
   - Redis: localhost:6379

## Development

Use the Makefile for common tasks:

```bash
make dev     # Start all services in development mode
make api     # Run API service only
make worker  # Run Celery worker only  
make web     # Run Next.js frontend only
make format  # Format code
make test    # Run tests
```

## Services

- **web** (Next.js 14): Frontend with Supabase auth, mood check-ins, and celebrations
- **api** (FastAPI): Backend with JWT verification, business logic, and database access
- **worker** (Celery): Background tasks for reminders and email notifications
- **db** (PostgreSQL): Primary database via Supabase
- **cache** (Redis): Caching and Celery message broker

## Architecture

- Frontend uses Supabase for auth and realtime features
- API verifies JWT tokens and handles business logic
- Worker processes async tasks like email notifications
- All services communicate via secure endpoints

## Tech Stack

**Frontend**: Next.js 14, TypeScript, Tailwind, shadcn/ui, TanStack Query, Framer Motion  
**Backend**: FastAPI, Pydantic v2, PostgreSQL, Redis, Celery  
**Infrastructure**: Supabase (auth + realtime), Resend (email), PostHog (analytics), Sentry (errors)