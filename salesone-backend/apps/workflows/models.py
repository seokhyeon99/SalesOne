from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from apps.common.models import BaseModel
from apps.tasks.models import Task

User = get_user_model()


class Workflow(BaseModel):
    """
    Model for storing workflow definitions consisting of nodes and edges.
    """
    TRIGGER_TYPES = (
        ('none', 'None'),
        ('client', 'Client'),
        ('event', 'Event'),
    )

    name = models.CharField(max_length=255, verbose_name=_('Workflow Name'))
    description = models.TextField(null=True, blank=True)
    nodes = models.JSONField(default=dict, verbose_name=_('Workflow Nodes'))
    edges = models.JSONField(default=list, verbose_name=_('Workflow Edges'))
    is_active = models.BooleanField(default=False)
    is_template = models.BooleanField(default=False, help_text=_('Whether this workflow serves as a template'))
    trigger_type = models.CharField(max_length=10, choices=TRIGGER_TYPES, default='none')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workflows')
    
    def __str__(self):
        return self.name
        
    def save(self, *args, **kwargs):
        # Determine trigger type based on nodes
        if self.nodes:
            start_nodes = [node for node in self.nodes.values() if node.get('type') == 'triggerNode']
            if start_nodes:
                start_node = start_nodes[0]
                self.trigger_type = start_node.get('data', {}).get('type', 'none')
            else:
                self.trigger_type = 'none'
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _('Workflow')
        verbose_name_plural = _('Workflows')
        ordering = ['-created_at']


class WorkflowExecution(BaseModel):
    """
    Model for tracking workflow executions and their status.
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('running', _('Running')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
    ]
    
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='executions')
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='workflow_executions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    input_data = models.JSONField(default=dict)
    output_data = models.JSONField(default=dict)
    error_message = models.TextField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.workflow.name} - {self.status}"
        
    class Meta:
        verbose_name = _('Workflow Execution')
        verbose_name_plural = _('Workflow Executions')
        ordering = ['-created_at']


class WorkflowSchedule(BaseModel):
    """
    Model for scheduling periodic workflow executions.
    """
    FREQUENCY_CHOICES = [
        ('hourly', _('Hourly')),
        ('daily', _('Daily')),
        ('weekly', _('Weekly')),
        ('monthly', _('Monthly')),
        ('custom', _('Custom (Cron)')),
    ]
    
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='schedules')
    name = models.CharField(max_length=255, verbose_name=_('Schedule Name'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily')
    
    # For custom cron schedules
    cron_expression = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        help_text=_('Cron expression for custom schedules (e.g., "0 8 * * 1" for every Monday at 8 AM)')
    )
    
    # For specific time scheduling
    run_at_hour = models.PositiveSmallIntegerField(null=True, blank=True, help_text=_('Hour (0-23)'))
    run_at_minute = models.PositiveSmallIntegerField(null=True, blank=True, help_text=_('Minute (0-59)'))
    
    # For weekly schedules
    run_on_days = models.JSONField(
        default=list, 
        blank=True,
        help_text=_('Days to run on for weekly schedules (0=Monday, 6=Sunday)')
    )
    
    # For monthly schedules
    run_on_day_of_month = models.PositiveSmallIntegerField(
        null=True, 
        blank=True,
        help_text=_('Day of month to run on (1-31)')
    )
    
    # Configuration data to use when executing
    input_data = models.JSONField(default=dict, blank=True)
    
    # Tracking fields
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.workflow.name}"
    
    class Meta:
        verbose_name = _('Workflow Schedule')
        verbose_name_plural = _('Workflow Schedules')
        ordering = ['workflow__name', 'name']
