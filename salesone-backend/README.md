# SalesOne Backend

A robust backend for the SalesOne Sales Engagement Platform (SEP) built with Django.

## Technology Stack

- **Framework**: Django
- **API**: Django Rest Framework
- **Database**: PostgreSQL
- **Caching**: Redis
- **Task Queue**: Celery
- **Search Engine**: PostgreSQL Full-Text Search
- **Authentication**: JWT
- **Email Delivery**: SendGrid/Mailgun with tracking
- **Workflow Engine**: Custom execution engine with pluggable actions

## Project Structure

```
/salesone                       # Main project directory
├── salesone/                   # Project settings
│   ├── __init__.py
│   ├── settings/               # Split settings
│   │   ├── __init__.py
│   │   ├── base.py             # Base settings
│   │   ├── development.py      # Development settings
│   │   └── production.py       # Production settings
│   ├── urls.py                 # Main URL configuration
│   ├── wsgi.py                 # WSGI configuration
│   └── asgi.py                 # ASGI configuration
├── apps/                       # Django applications
│   ├── accounts/               # User authentication and profiles
│   ├── products/               # Product management
│   ├── leads/                  # Lead management
│   ├── campaigns/              # Campaign management
│   ├── opportunities/          # Opportunity management
│   ├── clients/                # Client management
│   ├── tasks/                  # Task management
│   └── workflows/              # Workflow management
└── common/                     # Shared utilities
```

## Development Setup

### Prerequisites

- Python 3.10+
- PostgreSQL
- Redis
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/salesone-backend.git
   cd salesone-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

7. Access the API at [http://localhost:8003/api/](http://localhost:8003/api/)

## Docker Setup

1. Make sure Docker and Docker Compose are installed
2. Run:
   ```bash
   docker-compose up -d
   ```

## Available Commands

- `python manage.py runserver` - Start the development server
- `python manage.py test` - Run tests
- `python manage.py makemigrations` - Create new migrations
- `python manage.py migrate` - Apply migrations
- `python manage.py createsuperuser` - Create admin user

## License

[MIT](LICENSE) 