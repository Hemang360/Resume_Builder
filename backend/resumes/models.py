import uuid
from django.db import models

class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.JSONField(
        default=dict,
        help_text="Resume content stored as JSON"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # This will auto-update on save

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Resume'
        verbose_name_plural = 'Resumes'

    def __str__(self):
        return f"Resume {str(self.id)[:8]}..."
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure updated_at is always set
        """
        # If this is an update (not a create), ensure we update the timestamp
        if self.pk is not None:
            from django.utils import timezone
            self.updated_at = timezone.now()
        
        super().save(*args, **kwargs)