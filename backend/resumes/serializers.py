from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
import json
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume model with enhanced JSON field handling.
    """
    
    content = serializers.JSONField(
        help_text="Resume content as JSON. Can contain any structure like personalInfo, experience, skills, etc."
    )
    
    # Make updated_at read-only but ensure it's included in responses
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Resume
        fields = ['id', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_content(self, value):
        """
        Validate that content is a valid JSON object
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("Content must be a JSON object")
        return value
        
    def update(self, instance, validated_data):
        """
        Enhanced update method with safe JSON field merging
        """
        if 'content' in validated_data:
            new_content = validated_data.get('content', {})
            
            # Get existing content
            existing_content = instance.content or {}
            
            # Safely merge JSON content
            merged_content = self.safe_merge_json(existing_content, new_content)
            instance.content = merged_content
            
            # Update the updated_at timestamp
            instance.updated_at = timezone.now()
            
        # Save the instance
        instance.save(update_fields=['content', 'updated_at'])
        
        return instance
    
    def safe_merge_json(self, existing, new_data):
        """
        Safely merge JSON objects with deep merging for nested objects
        and replacement for arrays and primitive values
        """
        if not isinstance(existing, dict):
            existing = {}
        if not isinstance(new_data, dict):
            return new_data
            
        result = existing.copy()
        
        for key, value in new_data.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                # Recursively merge nested objects
                result[key] = self.safe_merge_json(result[key], value)
            else:
                # Replace arrays, primitives, and non-dict values
                result[key] = value
                
        return result
    
    def to_representation(self, instance):
        """
        Customize the representation to ensure updated_at is always included
        """
        data = super().to_representation(instance)
        
        # Ensure updated_at is in ISO format
        if instance.updated_at:
            data['updated_at'] = instance.updated_at.isoformat()
            
        return data

class ResumeConflictSerializer(serializers.Serializer):
    """
    Serializer for conflict response data
    """
    error = serializers.CharField()
    current_updated_at = serializers.DateTimeField()
    provided_updated_at = serializers.DateTimeField(required=False)
    message = serializers.CharField()