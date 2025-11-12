from rest_framework import serializers
from .models import Workflow, WorkflowExecution, WorkflowSchedule
from apps.tasks.serializers import TaskSerializer


class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = [
            'id', 'name', 'description', 'nodes', 'edges',
            'is_active', 'is_template', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class WorkflowExecutionSerializer(serializers.ModelSerializer):
    workflow = WorkflowSerializer(read_only=True)
    workflow_id = serializers.UUIDField(write_only=True)
    task = TaskSerializer(read_only=True)
    task_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = WorkflowExecution
        fields = [
            'id', 'workflow', 'workflow_id', 'task', 'task_id',
            'status', 'input_data', 'output_data', 'error_message',
            'started_at', 'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'status', 'output_data', 'error_message', 'started_at',
            'completed_at', 'created_at', 'updated_at'
        ]
        
    def create(self, validated_data):
        workflow_id = validated_data.pop('workflow_id')
        task_id = validated_data.pop('task_id', None)
        
        execution = WorkflowExecution.objects.create(
            workflow_id=workflow_id,
            task_id=task_id,
            **validated_data
        )
            
        return execution


class WorkflowScheduleSerializer(serializers.ModelSerializer):
    workflow = WorkflowSerializer(read_only=True)
    workflow_id = serializers.UUIDField(write_only=True)
    next_run_display = serializers.SerializerMethodField()
    last_run_display = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkflowSchedule
        fields = [
            'id', 'name', 'workflow', 'workflow_id', 'is_active', 
            'frequency', 'cron_expression', 'run_at_hour', 'run_at_minute',
            'run_on_days', 'run_on_day_of_month', 'input_data',
            'last_run', 'next_run', 'last_run_display', 'next_run_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['last_run', 'next_run', 'created_at', 'updated_at']
        
    def get_next_run_display(self, obj):
        """Return a formatted string of the next run time"""
        if obj.next_run:
            return obj.next_run.strftime('%Y-%m-%d %H:%M')
        return None
        
    def get_last_run_display(self, obj):
        """Return a formatted string of the last run time"""
        if obj.last_run:
            return obj.last_run.strftime('%Y-%m-%d %H:%M')
        return None
    
    def validate(self, data):
        """Validate schedule parameters based on frequency"""
        frequency = data.get('frequency')
        
        if frequency == 'custom' and not data.get('cron_expression'):
            raise serializers.ValidationError(
                {"cron_expression": "Cron expression is required for custom frequency"}
            )
            
        if frequency in ['daily', 'weekly', 'monthly']:
            if data.get('run_at_hour') is None or data.get('run_at_minute') is None:
                raise serializers.ValidationError(
                    {"run_at_hour": "Hour and minute are required for daily, weekly, and monthly frequencies"}
                )
            
            # Validate hour and minute
            hour = data.get('run_at_hour', 0)
            minute = data.get('run_at_minute', 0)
            
            if not (0 <= hour <= 23):
                raise serializers.ValidationError(
                    {"run_at_hour": "Hour must be between 0 and 23"}
                )
                
            if not (0 <= minute <= 59):
                raise serializers.ValidationError(
                    {"run_at_minute": "Minute must be between 0 and 59"}
                )
                
        # Validate weekly schedule
        if frequency == 'weekly' and not data.get('run_on_days'):
            raise serializers.ValidationError(
                {"run_on_days": "Days of week are required for weekly frequency"}
            )
            
        # Validate monthly schedule
        if frequency == 'monthly' and not data.get('run_on_day_of_month'):
            raise serializers.ValidationError(
                {"run_on_day_of_month": "Day of month is required for monthly frequency"}
            )
            
        if frequency == 'monthly' and data.get('run_on_day_of_month'):
            day = data.get('run_on_day_of_month')
            if not (1 <= day <= 31):
                raise serializers.ValidationError(
                    {"run_on_day_of_month": "Day of month must be between 1 and 31"}
                )
                
        return data
        
    def create(self, validated_data):
        from .tasks import update_workflow_schedule_next_run
        
        workflow_id = validated_data.pop('workflow_id')
        schedule = WorkflowSchedule.objects.create(
            workflow_id=workflow_id,
            **validated_data
        )
        
        # Calculate and set the next run time
        update_workflow_schedule_next_run.delay(str(schedule.id))
        
        return schedule


class NodeTypeSerializer(serializers.Serializer):
    """
    Serializer for node type schema information.
    """
    type = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField(allow_null=True, allow_blank=True)
    category = serializers.CharField(allow_null=True, allow_blank=True)
    icon = serializers.CharField(allow_null=True, allow_blank=True)
    input_schema = serializers.JSONField()
    output_schema = serializers.JSONField()
    config_schema = serializers.JSONField()
    
    def to_representation(self, instance):
        """
        Convert the node type data structure to the serializer format.
        """
        if isinstance(instance, dict):
            # If instance is already a dictionary with our desired structure, use it directly
            return super().to_representation(instance)
            
        # Otherwise, assume it's a tuple of (type, schema) from the node registry's get_all_schemas()
        node_type, schema = instance
        
        # Convert to our desired structure
        return {
            'type': node_type,
            'name': schema.get('name', node_type),
            'description': schema.get('description', ''),
            'category': schema.get('category', 'general'),
            'icon': schema.get('icon', 'puzzle-piece'),
            'input_schema': schema.get('input_schema', {}),
            'output_schema': schema.get('output_schema', {}),
            'config_schema': schema.get('config_schema', {}),
        }
