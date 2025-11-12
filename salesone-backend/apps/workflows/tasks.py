import asyncio
import logging
from django.utils import timezone
from celery import shared_task
from datetime import datetime, timedelta
import croniter
import pytz

# Import engine components directly
from .engine import WorkflowExecutor, WorkflowContext, WorkflowExecutionError

logger = logging.getLogger(__name__)

@shared_task
def execute_workflow(execution_id):
    """
    Execute a workflow asynchronously.
    
    Args:
        execution_id: ID of the WorkflowExecution record
    """
    # Import models here to avoid circular imports during Django app initialization
    from .models import WorkflowExecution
    
    try:
        # Get the workflow execution record
        execution = WorkflowExecution.objects.get(id=execution_id)
        
        if execution.status != 'pending':
            logger.warning(f"Workflow execution {execution_id} is not in pending state, skipping")
            return
        
        # Update status to running
        execution.status = 'running'
        execution.started_at = timezone.now()
        execution.save()
        
        # Get the workflow definition
        workflow = execution.workflow
        workflow_data = {
            'id': str(workflow.id),
            'name': workflow.name,
            'nodes': workflow.nodes,
            'edges': workflow.edges,
        }
        
        # Create execution context
        context_data = {
            'execution_id': str(execution.id),
            'workflow': workflow_data,
            'data': execution.input_data,
        }
        
        # Add task context if available
        if execution.task:
            context_data['task'] = {
                'id': str(execution.task.id),
                'title': execution.task.title,
                'description': execution.task.description,
            }
        
        # Create workflow context and executor
        context = WorkflowContext(**context_data)
        executor = WorkflowExecutor(workflow_data, context)
        
        # Execute the workflow
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(executor.execute())
        
        # Update the execution record with results
        execution.status = 'completed'
        execution.output_data = result
        execution.completed_at = timezone.now()
        execution.save()
        
        logger.info(f"Workflow execution {execution_id} completed successfully")
        
    except WorkflowExecution.DoesNotExist:
        logger.error(f"Workflow execution {execution_id} not found")
    except WorkflowExecutionError as e:
        logger.error(f"Workflow execution {execution_id} failed: {str(e)}")
        
        try:
            execution = WorkflowExecution.objects.get(id=execution_id)
            execution.status = 'failed'
            execution.error_message = str(e)
            execution.completed_at = timezone.now()
            execution.save()
        except Exception as ex:
            logger.error(f"Failed to update execution status: {str(ex)}")
    except Exception as e:
        logger.exception(f"Unexpected error in workflow execution {execution_id}: {str(e)}")
        
        try:
            execution = WorkflowExecution.objects.get(id=execution_id)
            execution.status = 'failed'
            execution.error_message = str(e)
            execution.completed_at = timezone.now()
            execution.save()
        except Exception as ex:
            logger.error(f"Failed to update execution status: {str(ex)}")


@shared_task
def update_workflow_schedule_next_run(schedule_id):
    """
    Calculate and update the next run time for a workflow schedule.
    
    Args:
        schedule_id: ID of the WorkflowSchedule record
    """
    # Import models here to avoid circular imports
    from .models import WorkflowSchedule
    
    try:
        schedule = WorkflowSchedule.objects.get(id=schedule_id)
        
        if not schedule.is_active:
            logger.info(f"Schedule {schedule_id} is inactive, not updating next run time")
            return
            
        now = timezone.now()
        next_run = None
        
        # Calculate next run time based on frequency
        if schedule.frequency == 'hourly':
            # Next hour at the same minute
            next_minute = schedule.run_at_minute if schedule.run_at_minute is not None else 0
            next_run = now.replace(minute=next_minute, second=0, microsecond=0)
            if next_run <= now:
                next_run = next_run + timedelta(hours=1)
                
        elif schedule.frequency == 'daily':
            # Next day at the specified time
            hour = schedule.run_at_hour
            minute = schedule.run_at_minute
            next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            if next_run <= now:
                next_run = next_run + timedelta(days=1)
                
        elif schedule.frequency == 'weekly':
            # Next occurrence of the specified day(s) of week
            hour = schedule.run_at_hour
            minute = schedule.run_at_minute
            days = schedule.run_on_days or [0]  # Default to Monday if not specified
            
            # Find the next day of week that matches
            next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # If today's weekday is in the list but the time has passed, start from tomorrow
            if next_run <= now:
                next_run = next_run + timedelta(days=1)
                
            # Find the next day that matches the specified days of week
            days_to_check = 7  # Check up to a week
            current_day = next_run
            found = False
            
            for _ in range(days_to_check):
                weekday = current_day.weekday()  # 0=Monday, 6=Sunday
                if weekday in days:
                    next_run = current_day
                    found = True
                    break
                current_day = current_day + timedelta(days=1)
                
            if not found:
                # If no matching day found, default to next Monday
                logger.warning(f"No matching day found for schedule {schedule_id}, defaulting to next Monday")
                next_run = next_run + timedelta(days=(7 - next_run.weekday()))
                
        elif schedule.frequency == 'monthly':
            # Next occurrence of the specified day of month
            day = schedule.run_on_day_of_month
            hour = schedule.run_at_hour
            minute = schedule.run_at_minute
            
            # Try to create a datetime for this month
            try:
                next_run = now.replace(day=day, hour=hour, minute=minute, second=0, microsecond=0)
                # If it's in the past, go to next month
                if next_run <= now:
                    # Move to the first of next month, then try to set the day
                    if now.month == 12:
                        next_run = now.replace(year=now.year+1, month=1, day=1, 
                                               hour=hour, minute=minute, second=0, microsecond=0)
                    else:
                        next_run = now.replace(month=now.month+1, day=1, 
                                               hour=hour, minute=minute, second=0, microsecond=0)
                        
                    # Handle day of month that might not exist in the next month
                    last_day = (next_run.replace(month=next_run.month+1 if next_run.month < 12 else 1, day=1) - 
                                timedelta(days=1)).day
                    next_run = next_run.replace(day=min(day, last_day))
            except ValueError:
                # Handle invalid day for current month (e.g., Feb 30)
                if now.month == 12:
                    next_month = 1
                    next_year = now.year + 1
                else:
                    next_month = now.month + 1
                    next_year = now.year
                    
                # Get the last day of the current month
                if now.month == 12:
                    last_day = 31
                else:
                    last_day = (datetime(now.year, now.month+1, 1) - timedelta(days=1)).day
                    
                # Use either the requested day or the last day of the month, whichever is smaller
                use_day = min(day, last_day)
                next_run = now.replace(day=use_day, hour=hour, minute=minute, second=0, microsecond=0)
                
                # If it's still in the past, go to next month
                if next_run <= now:
                    # Get the last day of next month
                    if next_month == 12:
                        last_day_next = 31
                    else:
                        last_day_next = (datetime(next_year, next_month+1, 1) - timedelta(days=1)).day
                        
                    use_day_next = min(day, last_day_next)
                    next_run = datetime(next_year, next_month, use_day_next, hour, minute)
                    next_run = pytz.timezone(timezone.get_current_timezone_name()).localize(next_run)
                
        elif schedule.frequency == 'custom':
            # Use croniter to calculate the next run time based on cron expression
            if schedule.cron_expression:
                try:
                    # Create a croniter iterator
                    cron = croniter.croniter(schedule.cron_expression, now)
                    # Get the next execution time
                    next_datetime = cron.get_next(datetime)
                    # Convert to timezone-aware datetime
                    next_run = pytz.timezone(timezone.get_current_timezone_name()).localize(next_datetime)
                except (ValueError, croniter.CroniterBadCronError) as e:
                    logger.error(f"Invalid cron expression for schedule {schedule_id}: {str(e)}")
                    # Default to tomorrow at the same time
                    next_run = now + timedelta(days=1)
            else:
                # Default to tomorrow at the same time if no cron expression
                next_run = now + timedelta(days=1)
                
        # Update the schedule with the calculated next run time
        if next_run:
            schedule.next_run = next_run
            schedule.save(update_fields=['next_run'])
            logger.info(f"Updated next run time for schedule {schedule_id} to {next_run}")
        else:
            logger.error(f"Failed to calculate next run time for schedule {schedule_id}")
            
    except WorkflowSchedule.DoesNotExist:
        logger.error(f"Workflow schedule {schedule_id} not found")
    except Exception as e:
        logger.exception(f"Error updating next run time for schedule {schedule_id}: {str(e)}")


@shared_task
def execute_scheduled_workflows():
    """
    Periodic task to execute workflows that are scheduled to run.
    This should be run every minute by Celery Beat.
    """
    # Import models here to avoid circular imports
    from .models import WorkflowSchedule, WorkflowExecution
    
    try:
        now = timezone.now()
        logger.info(f"Checking for scheduled workflows to execute at {now}")
        
        # Find all active schedules that are due to run
        schedules = WorkflowSchedule.objects.filter(
            is_active=True,
            next_run__lte=now
        ).select_related('workflow')
        
        executed_count = 0
        
        for schedule in schedules:
            try:
                # Check if the workflow is active
                if not schedule.workflow.is_active:
                    logger.warning(f"Workflow {schedule.workflow.id} is inactive, skipping scheduled execution")
                    continue
                
                logger.info(f"Executing scheduled workflow: {schedule.workflow.name} (schedule: {schedule.name})")
                
                # Create a new workflow execution
                execution = WorkflowExecution.objects.create(
                    workflow=schedule.workflow,
                    input_data=schedule.input_data or {},
                    status='pending',
                )
                
                # Execute the workflow asynchronously
                execute_workflow.delay(str(execution.id))
                
                # Update the last_run time
                schedule.last_run = now
                schedule.save(update_fields=['last_run'])
                
                executed_count += 1
                
                # Calculate the next run time
                update_workflow_schedule_next_run.delay(str(schedule.id))
                
            except Exception as e:
                logger.exception(f"Error executing scheduled workflow {schedule.workflow.id}: {str(e)}")
        
        logger.info(f"Executed {executed_count} scheduled workflows")
        
    except Exception as e:
        logger.exception(f"Error in execute_scheduled_workflows task: {str(e)}")


@shared_task
def cleanup_old_workflow_executions(days=30):
    """
    Delete old workflow executions that are older than the specified number of days.
    
    Args:
        days: Number of days to keep executions (default: 30)
    """
    # Import models here to avoid circular imports
    from .models import WorkflowExecution
    
    try:
        cutoff_date = timezone.now() - timedelta(days=days)
        logger.info(f"Deleting workflow executions older than {cutoff_date}")
        
        # Delete executions that are completed, failed, or cancelled and older than the cutoff date
        result = WorkflowExecution.objects.filter(
            created_at__lt=cutoff_date,
            status__in=['completed', 'failed', 'cancelled']
        ).delete()
        
        logger.info(f"Deleted {result[0]} old workflow executions")
        
    except Exception as e:
        logger.exception(f"Error cleaning up old workflow executions: {str(e)}") 