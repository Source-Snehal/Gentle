.PHONY: dev api worker web format test help

# Default target
help:
	@echo "Available targets:"
	@echo "  dev     - Start all services in development mode"
	@echo "  api     - Run API service only"
	@echo "  worker  - Run Celery worker only"
	@echo "  web     - Run Next.js frontend only"
	@echo "  format  - Format code in all services"
	@echo "  test    - Run tests for all services"

# Development
dev:
	docker-compose up --build

# Individual services
api:
	docker-compose up --build api

worker:
	docker-compose up --build worker

web:
	docker-compose up --build web

# Code formatting
format:
	docker-compose exec api black app/
	docker-compose exec api isort app/
	docker-compose exec web npm run format

# Testing
test:
	docker-compose exec api pytest
	docker-compose exec web npm run test

# Utility targets
build:
	docker-compose build

clean:
	docker-compose down -v
	docker system prune -f

logs:
	docker-compose logs -f

shell-api:
	docker-compose exec api bash

shell-web:
	docker-compose exec web bash