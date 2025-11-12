from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer
import threading
import time


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling task operations.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter tasks based on current user and optional client_id parameter.
        """
        user = self.request.user
        client_id = self.request.query_params.get('client_id', None)
        
        # Base queryset - tasks assigned to the user or created by the user
        queryset = Task.objects.filter(
            Q(assignee=user) | Q(created_by=user)
        )
        
        # Filter by client if client_id is provided
        if client_id:
            queryset = queryset.filter(client_id=client_id)
            
        return queryset.select_related('client', 'assignee', 'created_by')
    
    def perform_create(self, serializer):
        """
        Create new task, setting the current user as the creator.
        """
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['PATCH'])
    def update_status(self, request, pk=None):
        """
        Update the status of a task.
        """
        task = self.get_object()
        status_value = request.data.get('status')
        
        if status_value not in dict(Task.STATUS_CHOICES).keys():
            return Response(
                {'error': 'Invalid status value'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task.status = status_value
        task.save()
        
        return Response(self.get_serializer(task).data)
        
    @action(detail=False, methods=['GET'])
    def by_client(self, request):
        """
        List all tasks associated with a specific client.
        """
        client_id = request.query_params.get('client_id')
        if not client_id:
            return Response(
                {'error': 'client_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        tasks = self.get_queryset().filter(client_id=client_id)
        serializer = self.get_serializer(tasks, many=True)
        
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def kanban(self, request):
        """
        Get tasks grouped by status for the Kanban board.
        
        Returns:
            A dictionary with tasks grouped by status categories:
            - not_started: Tasks that have not been started
            - in_progress: Tasks in progress
            - completed: Completed tasks
            - failed: Failed tasks
        """
        # Get all tasks for the current user
        tasks = self.get_queryset()
        
        # Group by status
        result = {
            'not_started': self.get_serializer(tasks.filter(status='not_started'), many=True).data,
            'in_progress': self.get_serializer(tasks.filter(status='in_progress'), many=True).data,
            'completed': self.get_serializer(tasks.filter(status='completed'), many=True).data,
            'failed': self.get_serializer(tasks.filter(status='failed'), many=True).data,
        }
        
        return Response(result)
    
    def _auto_complete_workflow_task(self, task_id):
        """
        Helper method to automatically complete a workflow task after 5 seconds.
        """
        # Sleep for 5 seconds
        time.sleep(5)
        
        try:
            # Get a fresh instance of the task to ensure we have the latest data
            task = Task.objects.get(id=task_id)
            
            # Only proceed if the task is still in_progress
            if task.status == 'in_progress':
                task.status = 'completed'
                task.save()
                print(f"Task '{task.name}' (ID: {task_id}) automatically completed after 5 seconds")
        except Task.DoesNotExist:
            print(f"Task with ID {task_id} no longer exists")
        except Exception as e:
            print(f"Error auto-completing task {task_id}: {str(e)}")
        
    @action(detail=True, methods=['PATCH'])
    def change_status(self, request, pk=None):
        """
        Update a task's status with drag-and-drop support for the Kanban board.
        
        Params:
            status: The new status for the task
            
        Returns:
            The updated task object
        """
        task = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if new_status not in dict(Task.STATUS_CHOICES).keys():
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(dict(Task.STATUS_CHOICES).keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task.status = new_status
        task.save()
        
        # If this is a workflow task being set to in_progress,
        # start a background thread to auto-complete it after 5 seconds
        if new_status == 'in_progress' and task.workflow_ids and len(task.workflow_ids) > 0:
            # Start a background thread to auto-complete the task after 5 seconds
            thread = threading.Thread(
                target=self._auto_complete_workflow_task,
                args=(task.id,)
            )
            thread.daemon = True  # Daemon threads don't prevent process exit
            thread.start()
        
        return Response(self.get_serializer(task).data)
