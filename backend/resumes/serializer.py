from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume model.
    
    Handles serialization and deserialization of resume data with flexible JSON content.
    """
    
    content = serializers.JSONField(
        help_text="Resume content as JSON. Can contain any structure like personalInfo, experience, skills, etc."
    )
    
    class Meta:
        model = Resume
        fields = ['id', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def update(self, instance, validated_data):
        """
        Allow partial updates of the content field.
        Merges new content with existing content for PATCH requests.
        """
        if 'content' in validated_data:
            # For partial updates, merge with existing content
            existing_content = instance.content or {}
            new_content = validated_data.get('content', {})
            
            # If it's a partial update, merge the dictionaries
            if isinstance(existing_content, dict) and isinstance(new_content, dict):
                merged_content = {**existing_content, **new_content}
                instance.content = merged_content
            else:
                instance.content = new_content
                
        return super().update(instance, validated_data)