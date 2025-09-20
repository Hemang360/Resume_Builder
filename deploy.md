# Deployment Guide 🚀

This guide provides step-by-step instructions for deploying the Resume Builder application to production.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Render)](#backend-deployment-render)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Post-Deployment Setup](#post-deployment-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

## 🏗️ Architecture Overview

- **Frontend**: React + TypeScript + Vite deployed on **Vercel**
- **Backend**: Django + Channels + Redis deployed on **Render**
- **Database**: PostgreSQL (Render managed)
- **Redis**: Redis (Render managed)

## ✅ Prerequisites

- GitHub account with repository access
- Vercel account
- Render account
- Domain name (optional)

## 🎨 Frontend Deployment (Vercel)

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select the **frontend** folder as the root directory
5. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### 2. Environment Variables (Vercel)

In Vercel dashboard → Project → Settings → Environment Variables:

```bash
# Production API URL
VITE_API_BASE_URL=https://your-backend.onrender.com

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

### 3. Custom Domain (Optional)

In Vercel dashboard → Project → Settings → Domains:
1. Add your custom domain
2. Configure DNS records as instructed
3. Enable SSL (automatic)

### 4. Preview Deployments

- Every PR creates a preview deployment
- Branch deployments available for staging

## ⚙️ Backend Deployment (Render)

### 1. Create Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "PostgreSQL"
3. Configure database:
   - **Name**: resume-builder-db
   - **Region**: Choose closest to users
   - **Plan**: Free tier or paid based on needs
4. Save database credentials

### 2. Create Redis Instance

1. In Render dashboard → "New" → "Redis"
2. Configure Redis:
   - **Name**: resume-builder-redis
   - **Region**: Same as database
   - **Plan**: Free tier or paid
3. Save Redis URL

### 3. Deploy Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: resume-builder-api
   - **Root Directory**: backend
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     python manage.py collectstatic --noinput
     python manage.py migrate
     ```
   - **Start Command**:
     ```bash
     daphne -b 0.0.0.0 -p $PORT resume_api.asgi:application
     ```
   - **Plan**: Free tier or paid

### 4. Environment Variables (Render)

In Render dashboard → Service → Settings → Environment:

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DEBUG=False
DJANGO_SETTINGS_MODULE=resume_api.settings

# Database (from Render PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Redis (from Render Redis)
REDIS_URL=redis://red-xxxxx:6379

# CORS Settings
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com
ALLOWED_HOSTS=your-backend.onrender.com,localhost,127.0.0.1

# Optional: Email settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Optional: AWS S3 for file storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1

# Optional: Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn
```

### 5. Health Check Endpoint

Render automatically uses `/health/` endpoint. Ensure it's configured:

```python
# backend/resume_api/urls.py
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy'})

urlpatterns = [
    # ... other patterns
    path('health/', health_check, name='health_check'),
]
```

## 🔐 GitHub Secrets Configuration

For CI/CD automation, add these secrets in GitHub → Settings → Secrets and variables → Actions:

### Vercel Secrets
```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### Render Secrets
```bash
RENDER_API_KEY=your-render-api-key
RENDER_PROD_SERVICE_ID=your-production-service-id
RENDER_STAGING_SERVICE_ID=your-staging-service-id
```

### Application Secrets
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
```

## 🚀 Post-Deployment Setup

### 1. Create Superuser

Access Render shell and create Django admin user:

```bash
# In Render dashboard → Service → Shell
python manage.py createsuperuser
```

### 2. Load Sample Data

```bash
# Create demo resume
python manage.py create_demo_resume

# Or load fixtures if available
python manage.py loaddata demo_data.json
```

### 3. Configure CORS

Update CORS settings in production:

```python
# backend/resume_api/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.vercel.app",
    "https://your-custom-domain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

### 4. SSL and Security Headers

Render automatically provides SSL. For additional security:

```python
# backend/resume_api/settings.py
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

## 📊 Monitoring and Maintenance

### 1. Logging

Render provides built-in logging. For advanced logging:

```python
# backend/resume_api/settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

### 2. Performance Monitoring

Consider adding:
- **Sentry** for error tracking
- **New Relic** for performance monitoring
- **Uptime monitoring** service

### 3. Backups

- **PostgreSQL**: Render provides automatic backups
- **Redis**: Consider periodic data exports
- **User uploads**: Use AWS S3 with versioning

### 4. Scaling

**Frontend (Vercel):**
- Automatic scaling
- CDN distribution
- Edge functions available

**Backend (Render):**
- Vertical scaling: Upgrade plan
- Horizontal scaling: Multiple instances
- Database scaling: Read replicas

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
- Check build logs in Render/Vercel
- Verify dependencies in requirements.txt/package.json
- Check environment variables

#### Database Connection Errors
- Verify DATABASE_URL format
- Check database is running
- Confirm network connectivity

#### CORS Errors
- Verify CORS_ALLOWED_ORIGINS includes frontend URL
- Check protocol (http vs https)
- Ensure credentials are allowed if needed

#### WebSocket Connection Issues
- Check Redis connectivity
- Verify WebSocket support in hosting
- Check firewall/security groups

### Debug Commands

```bash
# Check Django configuration
python manage.py check --deploy

# Test database connection
python manage.py dbshell

# Check Redis connection
python manage.py shell
>>> from django.core.cache import cache
>>> cache.set('test', 'value')
>>> cache.get('test')

# View logs
# Render: Dashboard → Service → Logs
# Vercel: Dashboard → Project → Functions → Logs
```

## 🔄 Rollback Strategy

### Frontend Rollback (Vercel)
1. Go to Deployments tab
2. Click on previous successful deployment
3. Click "Promote to Production"

### Backend Rollback (Render)
1. Go to Service → Deploys
2. Find previous successful deploy
3. Click "Redeploy" on that version

### Database Migrations
```bash
# Rollback last migration
python manage.py migrate app_name previous_migration_name
```

## 🔒 Security Checklist

- [ ] SECRET_KEY is secure and unique
- [ ] DEBUG=False in production
- [ ] CORS origins properly configured
- [ ] SSL/HTTPS enabled
- [ ] Database credentials secured
- [ ] API keys stored as environment variables
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] Error pages don't expose sensitive info
- [ ] Regular security updates applied

## 📞 Support

If you encounter issues during deployment:

1. Check the [troubleshooting section](#troubleshooting)
2. Review logs in your hosting platform
3. Open an issue on GitHub
4. Contact support at support@resume-builder.com

---

**Happy Deploying! 🎉**