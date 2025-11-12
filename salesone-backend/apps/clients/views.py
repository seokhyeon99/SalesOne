from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Prefetch, Count
from django.utils.translation import gettext_lazy as _
from .models import Client, ClientNote, ClientFile
from apps.tasks.models import Task
from .serializers import (
    ClientSerializer, ClientDetailSerializer,
    ClientNoteSerializer, ClientFileSerializer,
    TimelineItemSerializer, EmailSerializer
)
from apps.tasks.serializers import TaskSerializer
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing clients.
    """
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Client.objects.filter(user=self.request.user).prefetch_related(
            Prefetch('notes', queryset=ClientNote.objects.select_related('user')),
            Prefetch('files', queryset=ClientFile.objects.select_related('user'))
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClientDetailSerializer
        return ClientSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """
        Get all notes for a specific client.
        """
        client = self.get_object()
        notes = client.notes.all()
        serializer = ClientNoteSerializer(notes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        """
        Get all files for a specific client.
        """
        client = self.get_object()
        files = client.files.all()
        serializer = ClientFileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """
        Get a chronological timeline of client activities including notes and files.
        """
        client = self.get_object()
        
        # Get notes and files
        notes = ClientNote.objects.filter(client=client)
        files = ClientFile.objects.filter(client=client)
        
        # Combine and sort timeline items
        timeline_items = []
        
        for note in notes:
            timeline_items.append({
                'id': str(note.id),
                'type': 'note',
                'title': note.title,
                'content': note.content,
                'created_at': note.created_at,
                'created_by': note.user.email
            })
            
        for file in files:
            timeline_items.append({
                'id': str(file.id),
                'type': 'file',
                'name': file.name,
                'description': file.description,
                'file_url': file.file.url if file.file else None,
                'created_at': file.created_at,
                'created_by': file.user.email
            })
            
        # Sort by created_at in descending order
        timeline_items.sort(key=lambda x: x['created_at'], reverse=True)
        
        serializer = TimelineItemSerializer(timeline_items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def emails(self, request, pk=None):
        client = self.get_object()
        # For now, return empty list as email functionality is not implemented yet
        serializer = EmailSerializer([], many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """
        Get all tasks associated with the client, including workflow-bound tasks.
        """
        client = self.get_object()
        
        # Get tasks for this client
        tasks = Task.objects.filter(client=client).select_related('assignee', 'created_by')
        
        # Group tasks by status
        pending_tasks = tasks.filter(status='not-finished')
        in_progress_tasks = tasks.filter(status='in-progress')
        completed_tasks = tasks.filter(status='completed')
        
        # Calculate summary statistics
        total_tasks = tasks.count()
        workflow_bound_tasks = tasks.exclude(workflow_ids=[]).count()
        overdue_tasks = tasks.filter(due_date__lt=timezone.now().date(), status__in=['not-finished', 'in-progress']).count()
        upcoming_tasks = tasks.filter(due_date__gte=timezone.now().date(), status__in=['not-finished', 'in-progress']).count()
        
        # Serialize tasks
        response_data = {
            'tasks': {
                'pending': TaskSerializer(pending_tasks, many=True).data,
                'in_progress': TaskSerializer(in_progress_tasks, many=True).data,
                'completed': TaskSerializer(completed_tasks, many=True).data,
            },
            'summary': {
                'total_tasks': total_tasks,
                'pending_tasks': pending_tasks.count(),
                'in_progress_tasks': in_progress_tasks.count(),
                'completed_tasks': completed_tasks.count(),
                'workflow_bound_tasks': workflow_bound_tasks,
                'overdue_tasks': overdue_tasks,
                'upcoming_tasks': upcoming_tasks,
            }
        }
        
        return Response(response_data)


class ClientNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing client notes.
    """
    serializer_class = ClientNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return ClientNote.objects.filter(
            client__user=self.request.user
        ).select_related('client', 'user')
    
    def perform_create(self, serializer):
        # Ensure the client belongs to the current user
        client = serializer.validated_data['client']
        if client.user != self.request.user:
            raise permissions.PermissionDenied(
                _("You don't have permission to add notes to this client.")
            )
        serializer.save(user=self.request.user)


class ClientFileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing client files.
    """
    serializer_class = ClientFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return ClientFile.objects.filter(
            client__user=self.request.user
        ).select_related('client', 'user')
    
    def perform_create(self, serializer):
        # Ensure the client belongs to the current user
        client = serializer.validated_data['client']
        if client.user != self.request.user:
            raise permissions.PermissionDenied(
                _("You don't have permission to add files to this client.")
            )
        
        # Set the name from the uploaded file if not provided
        if 'name' not in serializer.validated_data and 'file' in serializer.validated_data:
            file_obj = serializer.validated_data['file']
            serializer.validated_data['name'] = file_obj.name
            
        serializer.save(user=self.request.user)
