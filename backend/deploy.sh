#!/bin/bash

# Deployment script for Render
echo "🚀 Starting deployment to Render..."

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found. Please run this script from the backend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Check for any issues
echo "🔍 Checking for issues..."
python manage.py check --deploy

echo "✅ Deployment preparation complete!"
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://dashboard.render.com"
echo "3. Create a new Web Service"
echo "4. Connect your GitHub repository"
echo "5. Use the configuration from render.yaml"
