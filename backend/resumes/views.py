from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.http import parse_http_date_safe, http_date
from datetime import datetime
import zoneinfo
import json
from typing import Dict, Any
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Resume
from .serializers import ResumeSerializer, ResumeConflictSerializer


class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()  # type: ignore
    serializer_class = ResumeSerializer

    # Only allow specific actions
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def broadcast_resume_update(self, resume: Resume, action: str = 'update') -> None:
        """Broadcast resume update to WebSocket clients"""
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                room_group_name = f'resume_{resume.id}'
                resume_data = {
                    'id': resume.id,
                    'content': resume.content,
                    'created_at': resume.created_at.isoformat(),  # type: ignore
                    'updated_at': resume.updated_at.isoformat(),  # type: ignore
                }

                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': f'resume_{action}',
                        'data': resume_data
                    }
                )
        except Exception as e:
            # Log the error but don't fail the request
            print(f"WebSocket broadcast failed: {e}")
            pass

    def list(self, request, *args, **kwargs):
        """List all resumes"""
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """Create a new resume"""
        response = super().create(request, *args, **kwargs)

        # Add Last-Modified header and broadcast WebSocket message
        if response.status_code == 201:
            resume_id = response.data.get('id') if response.data else None
            if resume_id:
                try:
                    resume = Resume.objects.get(id=resume_id)  # type: ignore
                    response['Last-Modified'] = http_date(resume.updated_at.timestamp())
                    # Broadcast resume creation
                    self.broadcast_resume_update(resume, 'created')
                except Resume.DoesNotExist:  # type: ignore
                    pass

        return response

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific resume by ID with Last-Modified header"""
        response = super().retrieve(request, *args, **kwargs)

        if response.status_code == 200:
            resume = self.get_object()
            response['Last-Modified'] = http_date(resume.updated_at.timestamp())

        return response

    def partial_update(self, request, *args, **kwargs):
        """
        Enhanced partial update with conflict detection and safe JSON merging
        """
        resume = self.get_object()

        # Check for If-Unmodified-Since header for conflict detection
        if_unmodified_since = request.META.get('HTTP_IF_UNMODIFIED_SINCE')

        if if_unmodified_since:
            # Parse the If-Unmodified-Since header
            client_timestamp = parse_http_date_safe(if_unmodified_since)

            if client_timestamp is None:
                return Response(
                    {
                        'error': 'Invalid If-Unmodified-Since header format',
                        'message': 'Please provide a valid HTTP date format'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Convert to datetime for comparison
            client_datetime = datetime.fromtimestamp(client_timestamp, tz=zoneinfo.ZoneInfo('UTC'))

            # Check if the resume has been modified since the client's version
            if resume.updated_at > client_datetime:
                conflict_data = {
                    'error': 'Conflict detected',
                    'current_updated_at': resume.updated_at,
                    'provided_updated_at': client_datetime,
                    'message': 'The resume has been modified by another process. Please refresh and try again.'
                }

                serializer = ResumeConflictSerializer(conflict_data)
                return Response(
                    serializer.data,
                    status=status.HTTP_412_PRECONDITION_FAILED
                )

        # Validate input data
        serializer = self.get_serializer(resume, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Perform the update
        updated_resume = serializer.save()

        # Prepare response
        response_serializer = self.get_serializer(updated_resume)
        response = Response(response_serializer.data, status=status.HTTP_200_OK)

        # Add Last-Modified header with the new timestamp
        response['Last-Modified'] = http_date(updated_resume.updated_at.timestamp())

        # Broadcast resume update to WebSocket clients
        self.broadcast_resume_update(updated_resume, 'update')

        return response

    def update(self, request, *args, **kwargs):
        """
        Disable full updates - only allow partial updates
        """
        return Response(
            {
                'error': 'Method not allowed',
                'message': 'Full updates not allowed. Use PATCH for partial updates.',
                'allowed_methods': ['GET', 'POST', 'PATCH']
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def destroy(self, request, *args, **kwargs):
        """
        Disable delete operations
        """
        return Response(
            {
                'error': 'Method not allowed',
                'message': 'Delete operations not allowed.',
                'allowed_methods': ['GET', 'POST', 'PATCH']
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=True, methods=['post'], url_path='export_pdf')
    def export_pdf(self, request, pk=None):
        """
        Export resume as PDF
        """
        try:
            # Get the resume
            resume = self.get_object()

            # Prepare context for template
            context = self.prepare_resume_context(resume)

            # Render HTML template
            html_string = render_to_string('resumes/resume_pdf.html', context)

            # Generate PDF
            pdf_bytes = self.generate_pdf(html_string)

            # Create response
            response = HttpResponse(pdf_bytes, content_type='application/pdf')

            # Set filename based on resume content
            full_name = self.get_full_name(resume.content)
            filename = f"{full_name.replace(' ', '_')}_Resume.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            response['Content-Length'] = len(pdf_bytes)

            return response

        except Resume.DoesNotExist:  # type: ignore
            return Response(
                {'error': 'Resume not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'PDF generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], url_path='content_diff')
    def content_diff(self, request, pk=None):
        """
        Compare current resume content with provided content to show differences
        """
        resume = self.get_object()
        provided_content = request.query_params.get('compare_content')

        if not provided_content:
            return Response(
                {'error': 'compare_content parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            compare_content = json.loads(provided_content)
        except json.JSONDecodeError:
            return Response(
                {'error': 'Invalid JSON in compare_content parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Simple diff implementation
        diff = self.generate_content_diff(resume.content, compare_content)

        return Response({
            'current_content': resume.content,
            'provided_content': compare_content,
            'differences': diff,
            'current_updated_at': resume.updated_at
        })

    def generate_content_diff(self, current: Dict[str, Any], provided: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a simple diff between current and provided content
        """
        diff = {
            'added': {},
            'modified': {},
            'removed': {}
        }

        # Find additions and modifications
        for key, value in provided.items():
            if key not in current:
                diff['added'][key] = value
            elif current[key] != value:
                diff['modified'][key] = {
                    'old': current[key],
                    'new': value
                }

        # Find removals (keys in current but not in provided)
        for key in current:
            if key not in provided:
                diff['removed'][key] = current[key]

        return diff

    def prepare_resume_context(self, resume: Resume) -> Dict[str, Any]:
        """
        Prepare resume data for template rendering
        """
        content = resume.content or {}
        if not isinstance(content, dict):
            content = {}

        # Extract and structure data
        personal_info = content.get('personalInfo', {})
        education = content.get('education', [])
        if not isinstance(education, list):
            education = [education] if education else []

        skills = content.get('skills', [])
        if not isinstance(skills, list):
            skills = []

        extracurriculars = content.get('extracurriculars', [])
        if not isinstance(extracurriculars, list):
            extracurriculars = []

        projects = content.get('projects', [])
        if not isinstance(projects, list):
            projects = [projects] if projects else []

        essays = content.get('essays', {})
        academics = content.get('academics', {})
        career_interests = content.get('careerInterests', [])
        if not isinstance(career_interests, list):
            career_interests = []

        return {
            'resume': resume,
            'personal_info': personal_info,
            'education': education,
            'skills': skills,
            'extracurriculars': extracurriculars,
            'projects': projects,
            'essays': essays,
            'academics': academics,
            'career_interests': career_interests,
            'full_name': self.get_full_name(content),
            'current_year': 2025,
        }

    def get_full_name(self, content: Dict[str, Any]) -> str:
        """Extract full name from resume content"""
        personal_info = content.get('personalInfo', {}) if content else {}
        first_name = personal_info.get('firstName', '')
        last_name = personal_info.get('lastName', '')
        return f"{first_name} {last_name}".strip() or "Resume"

    def generate_pdf(self, html_string: str) -> bytes:
        """
        Generate PDF from HTML string using WeasyPrint
        """
        # Create font configuration
        font_config = FontConfiguration()

        # Define CSS for PDF styling (same as before)
        css_string = """
        @page {
            size: A4;
            margin: 0.75in;
            @bottom-right {
                content: counter(page) " / " counter(pages);
                font-size: 9pt;
                color: #666;
            }
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
        }

        /* ... rest of CSS styles from previous implementation ... */
        """

        # Create CSS object
        css = CSS(string=css_string, font_config=font_config)

        # Generate PDF
        html_doc = HTML(string=html_string)
        pdf_bytes = html_doc.write_pdf(stylesheets=[css], font_config=font_config)

        return pdf_bytes or b''
