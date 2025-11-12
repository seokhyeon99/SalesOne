# Docker Setup for SalesOne

This document provides instructions for running the SalesOne application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuration

1. **Environment Variables**:
   - Create a `.env` file based on `.env.example` in the project root
   - Update variables as needed (database credentials, API URLs, etc.)

## Available Commands

The following npm scripts are available for Docker operations:

```bash
# Start all services
npm run docker:up

# Start all services in detached mode
npm run docker:up:detach

# Stop all services
npm run docker:down

# Rebuild all containers
npm run docker:build

# View logs
npm run docker:logs

# Restart all services
npm run docker:restart

# Stop all services and remove volumes (caution: destroys data)
npm run docker:clean

# Run only the frontend
npm run docker:frontend

# Run only the backend
npm run docker:backend
```

## Service Architecture

The Docker environment includes the following services:

1. **frontend**: Next.js application running on port 3000
2. **backend**: Django application running on port 8003
3. **postgres**: PostgreSQL database on port 5432
4. **redis**: Redis for caching and message broker on port 6379
5. **celery**: Celery worker for async tasks
6. **celery-beat**: Celery beat for scheduled tasks

## Development Workflow

1. **First Run**:
   ```bash
   # Build and start all services
   npm run docker:build
   npm run docker:up
   ```

2. **Database Migrations**:
   ```bash
   # Apply migrations
   docker-compose exec backend python manage.py migrate
   
   # Create a superuser
   docker-compose exec backend python manage.py createsuperuser
   ```

3. **Accessing Services**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8003/api
   - Admin panel: http://localhost:8003/admin

## Production Deployment

For production deployment, modify the `docker-compose.yml` to use the `production` target for each service:

```yaml
backend:
  build:
    context: ./salesone-backend
    target: production
  # ... other configuration

frontend:
  build:
    context: ./salesone-frontend
    target: production
  # ... other configuration
```

## Troubleshooting

### Container Won't Start

If a container fails to start, check the logs:

```bash
docker-compose logs <service-name>
```

### Database Connection Issues

Ensure PostgreSQL is running and accessible:

```bash
docker-compose exec postgres pg_isready -U postgres
```

### Reset Everything

To completely reset your environment:

```bash
npm run docker:clean
docker-compose build --no-cache
npm run docker:up
``` 