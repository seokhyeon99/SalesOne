FROM python:3.12-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PYTHONHASHSEED=random

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project code
COPY . .

# Production image
FROM base as production

# Create a non-root user
RUN useradd -ms /bin/bash django
USER django

# Expose port for application
EXPOSE 8003

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8003", "salesone.wsgi:application"]

# Development image
FROM base as development

# Expose port for application
EXPOSE 8003

# Command to run the application in development mode
CMD ["python", "manage.py", "runserver", "0.0.0.0:8003"] 