# PostgreSQL Setup Guide for Resume Builder

This guide covers the PostgreSQL setup for the Resume Builder project, including local development and Render deployment.

## Overview

The project has been migrated from SQLite to PostgreSQL with the following features:
- Environment-based database configuration using `dj-database-url`
- Support for both local development and production deployment
- Docker Compose setup for local development
- Render deployment configuration

## Local Development Setup

### Prerequisites

1. **PostgreSQL**: Install PostgreSQL on your system
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS (with Homebrew)
   brew install postgresql
   brew services start postgresql
   
   # Windows: Download from https://www.postgresql.org/download/windows/
   ```

2. **Docker** (Optional): For containerized development
   ```bash
   # Install Docker and Docker Compose
   # Ubuntu/Debian
   sudo apt install docker.io docker-compose
   
   # macOS/Windows: Download Docker Desktop
   ```

### Database Setup

#### Option 1: Local PostgreSQL Installation

1. **Create database and user**:
   ```bash
   sudo -u postgres psql
   ```
   
   In the PostgreSQL shell:
   ```sql
   CREATE DATABASE resume_builder;
   CREATE USER postgres WITH PASSWORD 'postgres';
   ALTER USER postgres CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE resume_builder TO postgres;
   \q
   ```

2. **Set password for postgres user**:
   ```bash
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
   ```

#### Option 2: Docker Compose (Recommended)

1. **Start PostgreSQL and Redis**:
   ```bash
   cd /path/to/Resume_Builder
   docker compose up -d postgres redis
   ```

2. **Verify services are running**:
   ```bash
   docker compose ps
   ```

### Environment Configuration

1. **Copy environment template**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file** with your database credentials:
   ```env
   # Django Settings
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
   
   # Database Configuration
   DB_NAME=resume_builder
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   
   # Redis Configuration (for future WebSocket setup)
   REDIS_URL=redis://localhost:6379/0
   
   # Frontend API URL
   REACT_APP_API_URL=http://localhost:8000
   ```

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   source venv/bin/activate  # or create virtual environment
   pip install -r requirements.txt
   ```

2. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Create superuser** (optional):
   ```bash
   python manage.py createsuperuser
   ```

4. **Start development server**:
   ```bash
   python manage.py runserver
   ```

### Verification

Test the setup by:
1. Starting the Django server: `python manage.py runserver`
2. Visiting `http://localhost:8000/api/` to see the API
3. Checking the database connection: `python manage.py check --database default`

## Production Deployment (Render)

### Environment Variables

Set these environment variables in your Render dashboard:

```env
# Django Settings
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com

# Database (Render will provide this automatically)
DATABASE_URL=postgresql://username:password@host:port/database_name

# Redis (if using Redis addon)
REDIS_URL=redis://username:password@host:port

# Frontend API URL
REACT_APP_API_URL=https://your-app-name.onrender.com
```

### Render Configuration

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - Build Command: `cd backend && pip install -r requirements.txt && python manage.py migrate`
   - Start Command: `cd backend && python manage.py runserver 0.0.0.0:$PORT`
   - Environment: `Python 3`

4. **Add PostgreSQL database**:
   - Go to Render Dashboard
   - Create new PostgreSQL database
   - Copy the `DATABASE_URL` to your web service environment variables

5. **Deploy**:
   - Render will automatically build and deploy your application
   - The `DATABASE_URL` environment variable will be automatically configured

### Database Migrations in Production

Render will automatically run migrations during deployment if you include them in the build command:

```bash
cd backend && pip install -r requirements.txt && python manage.py migrate
```

## Database Configuration Details

### Django Settings

The project uses `dj-database-url` for flexible database configuration:

```python
# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # Production/Heroku/Render style DATABASE_URL
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    # Local development with PostgreSQL
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'resume_builder'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
```

### Connection Pooling

The configuration includes `conn_max_age=600` for connection pooling, which:
- Reuses database connections for up to 10 minutes
- Improves performance by reducing connection overhead
- Is suitable for production deployments

## Troubleshooting

### Common Issues

1. **Connection refused**:
   - Ensure PostgreSQL is running: `sudo systemctl status postgresql`
   - Check if port 5432 is available: `netstat -tlnp | grep 5432`

2. **Authentication failed**:
   - Verify database credentials in `.env` file
   - Check if postgres user has correct password

3. **Database does not exist**:
   - Create the database: `sudo -u postgres createdb resume_builder`

4. **Permission denied**:
   - Ensure postgres user has proper permissions
   - Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE resume_builder TO postgres;`

### Docker Issues

1. **Port already in use**:
   ```bash
   # Stop existing containers
   docker compose down
   
   # Or change ports in docker-compose.yml
   ```

2. **Volume permissions**:
   ```bash
   # Reset volumes if needed
   docker compose down -v
   docker compose up -d
   ```

## Migration from SQLite

If you have existing data in SQLite:

1. **Export data**:
   ```bash
   python manage.py dumpdata > data.json
   ```

2. **Switch to PostgreSQL** and run migrations

3. **Load data**:
   ```bash
   python manage.py loaddata data.json
   ```

## Next Steps

After PostgreSQL setup is complete:
1. Set up Redis for WebSocket functionality
2. Configure Django Channels for real-time features
3. Implement WebSocket consumers for resume updates
4. Add frontend WebSocket integration

## Files Modified

- `backend/requirements.txt` - Added `dj-database-url`
- `backend/resume_api/settings.py` - Updated database configuration
- `backend/.env.example` - Environment template
- `backend/.env.local` - Local development environment
- `docker-compose.yml` - PostgreSQL and Redis services
- `POSTGRES_SETUP.md` - This documentation
