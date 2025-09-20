# Quick Start Guide - PostgreSQL Setup

## Prerequisites Installation

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install Docker (optional, for containerized development)
sudo apt install docker.io docker-compose
```

## Database Setup

```bash
# Create database and set password
sudo -u postgres psql -c "CREATE DATABASE resume_builder;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

## Backend Setup

```bash
cd backend

# Install dependencies
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

## Docker Alternative

```bash
# Start PostgreSQL and Redis with Docker
docker compose up -d postgres redis

# Then follow backend setup steps above
```

## Verification

- Server should start at `http://localhost:8000`
- API available at `http://localhost:8000/api/`
- Database connection verified with migrations

## Production (Render)

1. Set environment variables in Render dashboard:
   - `DATABASE_URL` (provided by Render PostgreSQL addon)
   - `SECRET_KEY`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=your-app.onrender.com`

2. Deploy - migrations run automatically during build
