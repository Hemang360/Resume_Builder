# Resume Builder 🎓

A modern, AI-powered resume builder designed specifically for high school students applying to international universities. Create professional resumes with real-time collaboration, intelligent validation, and export to PDF.

![Resume Builder Demo](/demo/hero-screenshot.png)

## ✨ Features

- **🎯 Typeform-style Questions**: Intuitive step-by-step form with contextual guidance
- **📱 Real-time Preview**: See your resume update instantly as you type
- **🤝 Live Collaboration**: Multiple users can edit the same resume simultaneously
- **🧠 Smart Validation**: Field-specific validation for SAT scores, GPA formatting, and more
- **📊 Essay Length Meter**: Visual progress tracking for essays with word count warnings
- **💡 Contextual Tooltips**: Expert guidance on what university admissions officers look for
- **📄 PDF Export**: High-quality server-side PDF generation with professional formatting
- **💾 Auto-save & Offline**: Automatic saving with offline support and draft recovery
- **🔄 Undo/Redo**: Full history tracking with localStorage persistence
- **🌐 International Focus**: Tailored for students applying to foreign universities

## 🚀 Live Demo

- **🌟 Live Application**: [resume-builder.vercel.app](https://resume-builder.vercel.app)
- **📚 API Documentation**: [api.resume-builder.com/docs](https://api.resume-builder.com/docs)
- **🎮 Interactive Demo**: Try it with sample data

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI with type safety
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **TanStack Router** - Type-safe routing
- **WebSockets** - Real-time collaboration

### Backend
- **Django 5.0** + **Django REST Framework** - Robust API
- **Django Channels** - WebSocket support for real-time features
- **Redis** - Session storage and WebSocket message broker
- **PostgreSQL** - Primary database
- **WeasyPrint** - Professional PDF generation
- **Swagger/OpenAPI** - API documentation

### Infrastructure
- **Vercel** - Frontend deployment and CDN
- **Render** - Backend hosting with auto-scaling
- **GitHub Actions** - CI/CD pipeline
- **Sentry** - Error tracking and performance monitoring

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+
- PostgreSQL 15+ (or Docker)
- Redis 7+ (or Docker)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/resume-builder.git
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
pnpm install
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
pnpm dev
```

Visit http://localhost:5173 to see the application!

## 📊 Sample Data

The application includes a management command to create demo data:

```bash
# Create a sample resume with realistic data
python manage.py create_demo_resume

# Create multiple demo resumes
python manage.py create_demo_resume --count 5

# Create resume for specific user
python manage.py create_demo_resume --user admin@example.com
```

This creates:
- Complete student profile with realistic data
- SAT/TOEFL scores, GPA, and graduation date
- Leadership essay and extracurricular activities
- Skills and career interests
- Project descriptions and achievements

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
pnpm test              # Run unit tests
pnpm test:coverage     # Run with coverage
pnpm test:e2e         # Run end-to-end tests
pnpm lint             # Check code quality
pnpm type-check       # TypeScript validation
```

### Backend Tests
```bash
cd backend
python manage.py test                    # Run all tests
coverage run --source='.' manage.py test # With coverage
coverage report --show-missing           # Coverage report
python manage.py check --deploy         # Deployment checks
```

## 📚 API Documentation

### Interactive API Docs
- **Swagger UI**: localhost:8000/api/docs/
- **ReDoc**: localhost:8000/api/redoc/
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

## 🚢 Deployment

See [DEPLOY.md](./deploy.md) for comprehensive deployment instructions.

### Quick Deploy
- **Frontend (Vercel)**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/resume-builder)
- **Backend (Render)**: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🤝 Contributing

We welcome contributions! Please see our Contributing Guide for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- **Frontend**: ESLint + Prettier with TypeScript strict mode
- **Backend**: Black + isort + flake8 following PEP 8
- **Commits**: Conventional Commits format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **📖 Documentation**: [docs.resume-builder.com](https://docs.resume-builder.com)
- **💬 Discord Community**: [Join our Discord](https://discord.gg/resume-builder)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/yourusername/resume-builder/issues)
- **✉️ Email Support**: support@resume-builder.com

## 🌟 Acknowledgments

- Thanks to all university admissions counselors who provided guidance
- Inspired by modern resume builders but focused on international students
- Built with ❤️ for students pursuing global education

## 📈 Roadmap

- [ ] **AI Writing Assistant** - GPT integration for essay suggestions
- [ ] **Multiple Templates** - Various resume layouts and styles
- [ ] **University Database** - Integration with application requirements
- [ ] **Scholarship Matching** - Match students with relevant scholarships
- [ ] **Mobile App** - React Native mobile application
- [ ] **White Label Solution** - For educational institutions
- [ ] **Analytics Dashboard** - Track application success rates