# Resume Builder 

A modern resume builder designed specifically for high school students applying to international universities. Create professional resumes with real-time collaboration, intelligent validation, and export to PDF.


##  Features

- **Typeform-style Questions**: Intuitive step-by-step form with contextual guidance
- **Real-time Preview**: See your resume update instantly as you type
- **Live Collaboration**: Multiple users can edit the same resume simultaneously
- **Smart Validation**: Field-specific validation for SAT scores, GPA formatting, and more
- **Essay Length Meter**: Visual progress tracking for essays with word count warnings
- **Contextual Tooltips**: Expert guidance on what university admissions officers look for
- **PDF Export**: High-quality server-side PDF generation with professional formatting
- **Auto-save & Offline**: Automatic saving with offline support and draft recovery
- **Undo/Redo**: Full history tracking with localStorage persistence
- **International Focus**: Tailored for students applying to foreign universities

##  Live Demo

- **Live Application**: [https://resume-builder-blush-pi-13.vercel.app/](https://resume-builder-blush-pi-13.vercel.app/)
- **API Documentation**: [https://resume-builder-backend-7wxd.onrender.com/api/schema/](https://resume-builder-backend-7wxd.onrender.com/api/schema/)

##  Tech Stack

### Frontend
- **React** + **TypeScript** - Modern UI with type safety
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **TanStack Router** - Type-safe routing
- **WebSockets** - Real-time collaboration

### Backend
- **Django** + **Django REST Framework** - Robust API
- **Django Channels** - WebSocket support for real-time features
- **Redis** - Session storage and WebSocket message broker
- **PostgreSQL** - Primary database
- **WeasyPrint** - Professional PDF generation
- **Swagger/OpenAPI** - API documentation

### Infrastructure
- **Vercel** - Frontend deployment and CDN
- **Render** - Backend hosting with auto-scaling
- **GitHub Actions** - CI/CD pipeline

##  Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (or Docker)
- Redis 7+ (or Docker)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Hemang360/Resume_Builder
cd resume-builder

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py createsuperuser

# Create demo data
python manage.py create_demo_resume

# Setup frontend
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend (.env)**
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/resume_builder
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (.env)**
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Servers

```bash
# Terminal 1: Start Redis and PostgreSQL (if using Docker)
docker-compose up -d redis db

# Terminal 2: Start Django backend
cd backend
python manage.py runserver 8000

# Terminal 3: Start React frontend
cd frontend
npm run dev
```

Visit http://localhost:5173 to see the application!



##  API Documentation

### Interactive API Docs
- **Swagger UI**: localhost:8000/api/docs/
- **OpenAPI Schema**: localhost:8000/api/schema/

### Key Endpoints
```bash
# Resume Management  
POST   /api/resumes/                    # Create resume
GET    /api/resumes/{id}/              # Get resume
PATCH  /api/resumes/{id}/              # Update resume
POST   /api/resumes/{id}/export_pdf/   # Export to PDF

# Real-time Collaboration
WS     /ws/resume/{id}/                # WebSocket connection
```
