from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from apps.common.models import BaseModel
from apps.clients.models import Client

User = get_user_model()


class Task(BaseModel):
    """
    Model for managing tasks with optional workflow integration.
    """
    STATUS_CHOICES = [
        ('not_started', _('Not Started')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
    ]
    
    name = models.CharField(max_length=255, verbose_name=_('Task Name'))
    body = models.TextField(verbose_name=_('Task Description'))
    workflow_ids = ArrayField(models.UUIDField(), null=True, blank=True, verbose_name=_('Associated Workflow IDs'))
    workflow_data = models.JSONField(null=True, blank=True, verbose_name=_('Workflow Data'))
    due_date = models.DateField(null=True, blank=True)
    assignee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    
    # For recurring tasks
    is_repetitive = models.BooleanField(default=False)
    repetition_interval = models.IntegerField(null=True, blank=True, help_text=_('Days between repetitions'))
    repetition_end_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name = _('Task')
        verbose_name_plural = _('Tasks')
        ordering = ['due_date', '-created_at']
