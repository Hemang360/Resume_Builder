from django.db import models
import uuid

class Resume(models.Model):
    """
    Resume model to store resume data with flexible JSON content.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.JSONField(
        default=dict,
        help_text="Resume content as JSON. Can contain any structure like personalInfo, experience, skills, etc."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Resume'
        verbose_name_plural = 'Resumes'
    
    def __str__(self):
        # Try to get name from content, fallback to ID
        name = self.content.get('personalInfo', {}).get('name', '')
        return f"{name} - {self.id}" if name else str(self.id)
