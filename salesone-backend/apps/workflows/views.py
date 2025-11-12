from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Workflow, WorkflowExecution, WorkflowSchedule
from .serializers import (
    WorkflowSerializer, 
    WorkflowExecutionSerializer, 
    WorkflowScheduleSerializer,
    NodeTypeSerializer
)
from .engine import WorkflowExecutor, WorkflowContext, WorkflowExecutionError
from .nodes import get_node_schemas
from .tasks import execute_workflow, update_workflow_schedule_next_run

class WorkflowViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing workflows.
    """
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter workflows by current user"""
        return Workflow.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Add the current user to the workflow"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def templates(self, request):
        """Get workflow templates"""
        templates = Workflow.objects.filter(is_template=True)
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active workflows for task creation"""
        workflows = Workflow.objects.filter(
            user=self.request.user,
            is_active=True
        ).order_by('name')
        
        # Return minimal data needed for the task form
        result = [{
            'id': str(workflow.id),
            'name': workflow.name
        } for workflow in workflows]
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def node_types(self, request):
        """Get all available node types and their schemas"""
        node_schemas = get_node_schemas()
        # Convert to list of (type, schema) tuples for the serializer
        node_types = [(node_type, schema) for node_type, schema in node_schemas.items()]
        serializer = NodeTypeSerializer(node_types, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a workflow"""
        workflow = self.get_object()
        
        # Create a workflow execution record
        execution_data = {
            'workflow_id': workflow.id,
            'input_data': request.data.get('input_data', {})
        }
        
        # Add task_id if provided
        task_id = request.data.get('task_id')
        if task_id:
            execution_data['task_id'] = task_id
            
        execution_serializer = WorkflowExecutionSerializer(data=execution_data)
        if not execution_serializer.is_valid():
            return Response(execution_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        execution = execution_serializer.save()
        
        # Queue the execution task
        execute_workflow.delay(str(execution.id))
        
        # Return the execution record
        serializer = WorkflowExecutionSerializer(execution)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def execute_directly(self, request, pk=None):
        """
        Execute a workflow directly without creating a persistent execution record.
        This is useful for testing workflows or for one-off executions.
        """
        workflow = self.get_object()
        
        # Get workflow definition
        workflow_data = {
            'id': str(workflow.id),
            'name': workflow.name,
            'nodes': workflow.nodes,
            'edges': workflow.edges,
        }
        
        # Get input data
        input_data = request.data.get('input_data', {})
        
        try:
            # Create context with user information
            context_data = {
                'workflow': workflow_data,
                'data': input_data,
                'user': {
                    'id': str(request.user.id),
                    'username': request.user.username,
                    'email': request.user.email
                }
            }
            
            # Add task context if provided
            task_id = request.data.get('task_id')
            if task_id:
                from apps.tasks.models import Task
                try:
                    task = Task.objects.get(id=task_id)
                    context_data['task'] = {
                        'id': str(task.id),
                        'title': task.title,
                        'description': task.description,
                    }
                except Task.DoesNotExist:
                    return Response(
                        {'detail': f'Task with id {task_id} does not exist'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Create workflow context and executor
            context = WorkflowContext(**context_data)
            executor = WorkflowExecutor(workflow_data, context)
            
            # Execute workflow synchronously
            import asyncio
            result = asyncio.run(executor.execute())
            
            # Return execution result
            response_data = {
                'workflow_id': str(workflow.id),
                'status': 'completed',
                'input_data': input_data,
                'output_data': result,
                'execution_stats': context.get_execution_stats(),
            }
            
            return Response(response_data)
            
        except WorkflowExecutionError as e:
            # Return error information
            return Response({
                'workflow_id': str(workflow.id),
                'status': 'failed',
                'input_data': input_data,
                'error': str(e),
                'node_id': getattr(e, 'node_id', None),
                'details': getattr(e, 'details', None),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            # Return generic error
            return Response({
                'workflow_id': str(workflow.id),
                'status': 'failed',
                'input_data': input_data,
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """
        Validate a workflow without executing it.
        Checks if all nodes are valid and connected properly.
        """
        workflow = self.get_object()
        
        # Get workflow definition
        workflow_data = {
            'id': str(workflow.id),
            'name': workflow.name,
            'nodes': workflow.nodes,
            'edges': workflow.edges,
        }
        
        try:
            # Create a minimal context
            context = WorkflowContext(workflow=workflow_data)
            executor = WorkflowExecutor(workflow_data, context)
            
            # Validate node configurations
            validation_errors = {}
            
            # Check that all nodes exist and are properly configured
            for node_id, node in executor.nodes.items():
                if not node.validate():
                    validation_errors[node_id] = node.get_validation_errors()
            
            # Check for start nodes
            start_nodes = executor._get_start_nodes()
            if not start_nodes:
                validation_errors['workflow'] = ["Workflow must have at least one start node"]
            
            # Check for isolated nodes (nodes with no incoming or outgoing connections)
            node_connections = {node_id: {'in': False, 'out': False} for node_id in executor.nodes}
            
            for edge in executor.edges.values():
                source = edge.get('source', {})
                target = edge.get('target', {})
                
                source_id = source.get('node')
                target_id = target.get('node')
                
                if source_id and source_id in node_connections:
                    node_connections[source_id]['out'] = True
                
                if target_id and target_id in node_connections:
                    node_connections[target_id]['in'] = True
            
            isolated_nodes = []
            for node_id, connections in node_connections.items():
                # A node is isolated if it has no incoming AND no outgoing connections
                # Exception: start nodes don't need incoming connections
                if not connections['in'] and not connections['out'] and node_id not in start_nodes:
                    isolated_nodes.append(node_id)
            
            if isolated_nodes:
                validation_errors['isolated_nodes'] = {
                    "message": "Workflow contains isolated nodes",
                    "nodes": isolated_nodes
                }
            
            # Return validation results
            is_valid = len(validation_errors) == 0
            return Response({
                'is_valid': is_valid,
                'errors': validation_errors if not is_valid else None,
            })
            
        except Exception as e:
            return Response({
                'is_valid': False,
                'errors': {'workflow': [str(e)]},
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'])
    def client_workflows(self, request):
        """
        List all workflows that start with a client trigger node.
        These workflows can be used in tasks and are eligible for client variable injection.
        """
        workflows = self.get_queryset().filter(
            is_active=True,
            trigger_type='client'
        )
        serializer = self.get_serializer(workflows, many=True)
        return Response(serializer.data)

class WorkflowExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for workflow executions.
    """
    queryset = WorkflowExecution.objects.all()
    serializer_class = WorkflowExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter executions by user's workflows"""
        return WorkflowExecution.objects.filter(workflow__user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a running workflow execution"""
        execution = self.get_object()
        
        if execution.status not in ['pending', 'running']:
            return Response(
                {'detail': 'Cannot cancel execution that is not pending or running'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        execution.status = 'cancelled'
        execution.completed_at = timezone.now()
        execution.save()
        
        serializer = self.get_serializer(execution)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def execution_state(self, request, pk=None):
        """
        Get detailed execution state information for a workflow execution.
        Includes node execution states, errors, and execution path.
        """
        execution = self.get_object()
        
        # Basic execution information
        result = {
            'id': str(execution.id),
            'workflow_id': str(execution.workflow.id),
            'workflow_name': execution.workflow.name,
            'status': execution.status,
            'started_at': execution.started_at,
            'completed_at': execution.completed_at,
            'duration': None,
            'input_data': execution.input_data,
            'output_data': execution.output_data,
        }
        
        # Calculate duration if both start and end times are available
        if execution.started_at and execution.completed_at:
            duration = (execution.completed_at - execution.started_at).total_seconds()
            result['duration'] = round(duration, 2)
        
        # Add task information if available
        if execution.task:
            result['task'] = {
                'id': str(execution.task.id),
                'title': execution.task.title,
            }
        
        # Get node execution details from output_data if available
        node_states = {}
        execution_path = []
        errors = []
        
        if 'context' in execution.output_data:
            context = execution.output_data.get('context', {})
            node_states = context.get('node_states', {})
            execution_path = context.get('execution_path', [])
            errors = context.get('errors', [])
        
        # Add execution details to result
        result['node_states'] = node_states
        result['execution_path'] = execution_path
        result['errors'] = errors
        
        # Add error message if execution failed
        if execution.status == 'failed' and execution.error_message:
            result['error_message'] = execution.error_message
        
        return Response(result)

class WorkflowScheduleViewSet(viewsets.ModelViewSet):
    """
    API endpoints for workflow schedules.
    """
    queryset = WorkflowSchedule.objects.all()
    serializer_class = WorkflowScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter schedules by user's workflows"""
        return WorkflowSchedule.objects.filter(workflow__user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle the active status of a schedule"""
        schedule = self.get_object()
        schedule.is_active = not schedule.is_active
        schedule.save(update_fields=['is_active'])
        
        # If activated, calculate the next run time
        if schedule.is_active:
            update_workflow_schedule_next_run.delay(str(schedule.id))
            
        serializer = self.get_serializer(schedule)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_next_run(self, request, pk=None):
        """Force update of the next run time"""
        schedule = self.get_object()
        
        # Queue task to update the next run time
        update_workflow_schedule_next_run.delay(str(schedule.id))
        
        return Response({'status': 'next run time calculation scheduled'})
