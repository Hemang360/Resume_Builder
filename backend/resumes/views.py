from rest_framework import viewsets, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample
from .models import Resume
from .serializer import ResumeSerializer

def deep_merge_dicts(dict1, dict2):
    """
    Deep merge two dictionaries, with dict2 values taking precedence.
    """
    result = dict1.copy()
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value
    return result

@extend_schema_view(
    list=extend_schema(
        summary="List all resumes",
        description="Retrieve a list of all resumes in the system.",
        tags=["Resumes"]
    ),
    create=extend_schema(
        summary="Create a new resume",
        description="Create a new resume with the provided content.",
        tags=["Resumes"],
        examples=[
            OpenApiExample(
                'Basic Resume Example',
                description='A simple resume with personal info and experience',
                value={
                    "content": {
                        "personalInfo": {
                            "name": "John Doe",
                            "email": "john.doe@example.com",
                            "phone": "+1-555-0123",
                            "address": "123 Main St, City, State 12345"
                        },
                        "experience": [
                            {
                                "company": "Tech Corp",
                                "position": "Software Engineer",
                                "duration": "2020-2023",
                                "description": "Developed web applications using Python and JavaScript"
                            }
                        ],
                        "skills": ["Python", "JavaScript", "React", "Django"],
                        "education": [
                            {
                                "institution": "University of Technology",
                                "degree": "Bachelor of Computer Science",
                                "year": "2019"
                            }
                        ]
                    }
                },
                request_only=True,
            ),
        ]
    ),
    retrieve=extend_schema(
        summary="Retrieve a specific resume",
        description="Get a specific resume by its UUID.",
        tags=["Resumes"]
    ),
    partial_update=extend_schema(
        summary="Partially update a resume",
        description="Update specific fields of a resume. The content will be merged with existing data.",
        tags=["Resumes"],
        examples=[
            OpenApiExample(
                'Partial Update Example',
                description='Update only specific sections of the resume',
                value={
                    "content": {
                        "personalInfo": {
                            "name": "John Smith",
                            "email": "john.smith@example.com"
                        },
                        "skills": ["Python", "JavaScript", "React", "Django", "PostgreSQL"]
                    }
                },
                request_only=True,
            ),
        ]
    ),
)
class ResumeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing resumes.
    
    Provides endpoints for creating, retrieving, listing, and partially updating resumes.
    Each resume contains flexible JSON content that can accommodate any resume structure.
    """
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    
    # Only allow specific actions
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    
    def list(self, request, *args, **kwargs):
        """List all resumes"""
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Create a new resume"""
        return super().create(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific resume by ID"""
        return super().retrieve(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Partially update a resume"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Handle content merging for partial updates
        if 'content' in request.data:
            existing_content = instance.content or {}
            new_content = request.data.get('content', {})
            
            # Deep merge the content dictionaries
            if isinstance(existing_content, dict) and isinstance(new_content, dict):
                merged_content = deep_merge_dicts(existing_content, new_content)
                # Update the serializer's validated_data
                serializer.validated_data['content'] = merged_content
        
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @extend_schema(exclude=True)
    def update(self, request, *args, **kwargs):
        """Disable full updates - only allow partial updates"""
        return Response(
            {'detail': 'Full updates not allowed. Use PATCH for partial updates.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @extend_schema(exclude=True)
    def destroy(self, request, *args, **kwargs):
        """Disable delete operations"""
        return Response(
            {'detail': 'Delete operations not allowed.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )