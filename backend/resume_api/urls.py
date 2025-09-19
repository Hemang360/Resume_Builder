from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Resume Builder API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'resume_app': '/api/resume_app/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/resume_app/', include('resume_app.urls')),
]
