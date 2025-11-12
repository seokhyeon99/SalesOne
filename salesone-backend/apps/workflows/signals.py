import logging
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)

# Import the model class inside the function to prevent circular imports
@receiver(post_save, sender='workflows.WorkflowExecution')
def auto_execute_workflow(sender, instance, created, **kwargs):
    """
    Automatically execute a workflow when it's created with auto_execute=True
    """
    # Delayed import to avoid circular dependencies
    from .tasks import execute_workflow
    
    if created and instance.status == 'pending' and instance.input_data.get('auto_execute', False):
        logger.info(f"Auto-executing workflow {instance.workflow.name} (id: {instance.id})")
        execute_workflow.delay(str(instance.id)) 