from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task
from apps.clients.serializers import ClientSerializer
from apps.clients.models import Client
import logging
import uuid

logger = logging.getLogger(__name__)
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']


class TaskSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.UUIDField(write_only=True, required=False)
    assignee = UserBasicSerializer(read_only=True)
    assignee_id = serializers.UUIDField(write_only=True, required=False)
    created_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'name', 'body', 'workflow_ids', 'workflow_data',
            'due_date', 'assignee', 'assignee_id', 'status', 'client',
            'client_id', 'created_by', 'created_at',
            'is_repetitive', 'repetition_interval', 'repetition_end_date'
        ]
        read_only_fields = ['id', 'created_at']
        
    def create(self, validated_data):
        # Extract fields that will be set explicitly
        client_id = validated_data.pop('client_id', None)
        assignee_id = validated_data.pop('assignee_id', None)
        
        # Remove fields to prevent duplicates
        for field in ['created_by', 'client', 'assignee']:
            if field in validated_data:
                validated_data.pop(field)
        
        # Get the user making the request from the context
        user = self.context['request'].user
        
        try:
            # Create task with minimal required fields
            task = Task(
                assignee=user,  # Default to the current user
                created_by=user,
                **validated_data
            )
            
            # Set client if provided
            if client_id:
                # Handle client_id as integer or UUID
                try:
                    if isinstance(client_id, str) and not client_id.isdigit():
                        # Try to parse as UUID
                        client_id = uuid.UUID(client_id)
                    
                    # Check if client exists
                    if not Client.objects.filter(id=client_id).exists():
                        logger.warning(f"Client with ID {client_id} does not exist")
                    
                    task.client_id = client_id
                except (ValueError, TypeError) as e:
                    logger.error(f"Invalid client_id format: {client_id}, error: {str(e)}")
                
            # Override with specified assignee if provided
            if assignee_id:
                task.assignee_id = assignee_id
                
            # Save once with all fields
            task.save()
            
            return task
            
        except Exception as e:
            logger.error(f"Error creating task: {str(e)}")
            logger.error(f"Validated data: {validated_data}")
            raise
        
    def update(self, instance, validated_data):
        # Extract fields that will be set explicitly
        client_id = validated_data.pop('client_id', None)
        assignee_id = validated_data.pop('assignee_id', None)
        
        # Remove fields to prevent duplicates
        for field in ['created_by', 'client', 'assignee']:
            if field in validated_data:
                validated_data.pop(field)
        
        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        # Set specific fields
        if assignee_id:
            instance.assignee_id = assignee_id
            
        if client_id:
            try:
                if isinstance(client_id, str) and not client_id.isdigit():
                    # Try to parse as UUID
                    client_id = uuid.UUID(client_id)
                
                instance.client_id = client_id
            except (ValueError, TypeError) as e:
                logger.error(f"Invalid client_id format: {client_id}, error: {str(e)}")
        
        instance.save()
        return instance
