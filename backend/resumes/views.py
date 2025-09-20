from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.conf import settings
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import tempfile
import os
from .models import Resume
from .serializers import ResumeSerializer

class ResumeViewSet(viewsets.ModelViewSet):
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
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    
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
            
        except Resume.DoesNotExist:
            return Response(
                {'error': 'Resume not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'PDF generation failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def prepare_resume_context(self, resume):
        """
        Prepare resume data for template rendering
        """
        content = resume.content or {}
        
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
    
    def get_full_name(self, content):
        """Extract full name from resume content"""
        personal_info = content.get('personalInfo', {}) if content else {}
        first_name = personal_info.get('firstName', '')
        last_name = personal_info.get('lastName', '')
        return f"{first_name} {last_name}".strip() or "Resume"
    
    def generate_pdf(self, html_string):
        """
        Generate PDF from HTML string using WeasyPrint
        """
        # Create font configuration
        font_config = FontConfiguration()
        
        # Define CSS for PDF styling
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
        
        .resume-container {
            max-width: 100%;
            margin: 0 auto;
        }
        
        .resume-header {
            text-align: center;
            border-bottom: 2pt solid #000;
            padding-bottom: 12pt;
            margin-bottom: 18pt;
        }
        
        .full-name {
            font-size: 18pt;
            font-weight: bold;
            margin: 0 0 8pt 0;
            text-transform: uppercase;
            letter-spacing: 1pt;
        }
        
        .contact-info {
            font-size: 10pt;
            line-height: 1.3;
        }
        
        .contact-item {
            display: inline-block;
            margin: 0 12pt 4pt 0;
        }
        
        .section {
            margin-bottom: 18pt;
            break-inside: avoid;
        }
        
        .section-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1pt solid #666;
            padding-bottom: 2pt;
            margin: 0 0 8pt 0;
            letter-spacing: 0.5pt;
        }
        
        .section-content {
            margin-left: 0;
        }
        
        .education-item, .project-item {
            margin-bottom: 12pt;
            break-inside: avoid;
        }
        
        .education-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4pt;
        }
        
        .institution-name, .project-title {
            font-weight: bold;
            font-size: 11pt;
        }
        
        .degree, .gpa {
            font-size: 10pt;
            color: #333;
            margin: 2pt 0;
        }
        
        .graduation-date {
            font-size: 10pt;
            color: #666;
        }
        
        .test-scores {
            display: flex;
            gap: 16pt;
            flex-wrap: wrap;
        }
        
        .test-score-item {
            background: #f5f5f5;
            border: 1pt solid #ddd;
            padding: 4pt 8pt;
            border-radius: 2pt;
            font-size: 10pt;
        }
        
        .test-name {
            font-weight: bold;
            margin-right: 4pt;
        }
        
        .essay-text, .project-description {
            text-align: justify;
            line-height: 1.5;
            margin: 4pt 0;
        }
        
        .activities-grid, .skills-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4pt;
            margin: 8pt 0;
        }
        
        .activity-item, .skill-item {
            background: #f8f9fa;
            border: 1pt solid #e9ecef;
            padding: 3pt 6pt;
            font-size: 9pt;
            text-align: center;
            border-radius: 2pt;
        }
        
        .interests-list {
            line-height: 1.5;
        }
        
        .word-count {
            font-size: 8pt;
            color: #999;
            font-style: italic;
            text-align: right;
            margin-top: 4pt;
        }
        
        /* Ensure proper page breaks */
        .section {
            page-break-inside: avoid;
        }
        
        .education-item, .project-item {
            page-break-inside: avoid;
        }
        """
        
        # Create CSS object
        css = CSS(string=css_string, font_config=font_config)
        
        # Generate PDF
        html_doc = HTML(string=html_string)
        pdf_bytes = html_doc.write_pdf(stylesheets=[css], font_config=font_config)
        
        return pdf_bytes
    
    def update(self, request, *args, **kwargs):
        """Disable full updates - only allow partial updates"""
        return Response(
            {'detail': 'Full updates not allowed. Use PATCH for partial updates.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def destroy(self, request, *args, **kwargs):
        """Disable delete operations"""
        return Response(
            {'detail': 'Delete operations not allowed.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )