# Backend Deployment Guide for Render

## Prerequisites
- GitHub repository with your backend code
- Render account (free tier available)

## Step 1: Prepare Your Repository

1. **Commit the new files:**
   ```bash
   git add render.yaml Procfile
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the `render.yaml` file
5. Click "Apply"

### Option B: Manual Setup
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `resume-builder-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `daphne -b 0.0.0.0 -p $PORT resume_api.asgi:application`
   - **Root Directory**: `backend`

## Step 3: Add Database
1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Name: `resume-builder-db`
3. Plan: Free
4. Note the connection string

## Step 4: Add Redis
1. In Render Dashboard, click "New +" → "Redis"
2. Name: `resume-builder-redis`
3. Plan: Free
4. Note the connection string

## Step 5: Configure Environment Variables
In your web service settings, add these environment variables:

- `SECRET_KEY`: Generate a secure key (Render can auto-generate)
- `DEBUG`: `False`
- `ALLOWED_HOSTS`: `your-app-name.onrender.com,localhost,127.0.0.1`
- `DATABASE_URL`: (Auto-provided by Render if using Blueprint)
- `REDIS_URL`: (Auto-provided by Render if using Blueprint)
- `WEBSOCKET_URL`: `wss://your-app-name.onrender.com/ws/`

## Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your API will be available at: `https://your-app-name.onrender.com`

## Step 7: Update Frontend
Update your frontend's API URL to point to your Render backend:
- Change `http://localhost:8000` to `https://your-app-name.onrender.com`

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that all dependencies are in `requirements.txt`
2. **Database connection fails**: Verify `DATABASE_URL` is set correctly
3. **WebSocket issues**: Ensure `WEBSOCKET_URL` uses `wss://` (secure WebSocket)
4. **Static files**: Make sure `collectstatic` runs during build

### Logs:
- Check deployment logs in Render Dashboard
- Use `render logs` CLI command for real-time logs

## Free Tier Limitations:
- Services sleep after 15 minutes of inactivity
- 750 hours/month limit
- Cold start takes ~30 seconds

## Production Considerations:
- Upgrade to paid plan for always-on service
- Set up custom domain
- Configure SSL certificates
- Set up monitoring and alerts
