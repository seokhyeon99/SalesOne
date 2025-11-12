from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
import pytz

from apps.workflows.models import Workflow, WorkflowSchedule
from apps.workflows.engine import WorkflowExecutor, NodeRegistry
from apps.workflows.nodes.base import Node

User = get_user_model()

class MockNode(Node):
    """A mock node for testing schedules."""
    node_type = "mock"
    node_name = "Mock Node"
    node_description = "A mock node for testing"
    
    def execute(self, context):
        return {"result": "success"}

class WorkflowScheduleEdgeCaseTest(TestCase):
    """Test cases for workflow schedule edge cases."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            name='Test User'
        )
        
        # Register mock node type
        self.registry = NodeRegistry()
        self.registry.register("mock", MockNode)
        
        # Create a test workflow
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={
                'node1': {
                    'type': 'mock',
                    'data': {'param': 'value'}
                }
            },
            edges={},
            is_active=True,
            is_template=False,
            user=self.user
        )
        
        # Create a basic schedule
        self.schedule = WorkflowSchedule.objects.create(
            name='Test Schedule',
            workflow=self.workflow,
            is_active=True,
            frequency='daily',
            run_at_hour=9,
            run_at_minute=0,
            input_data={'test': 'data'},
            user=self.user
        )

    def test_schedule_with_invalid_cron_expression(self):
        """Test schedule creation with invalid cron expression."""
        with self.assertRaises(ValueError):
            WorkflowSchedule.objects.create(
                name='Invalid Cron',
                workflow=self.workflow,
                is_active=True,
                frequency='custom',
                cron_expression='invalid cron',
                user=self.user
            )

    def test_schedule_with_past_next_run(self):
        """Test schedule with next_run in the past."""
        past_time = timezone.now() - timedelta(hours=1)
        self.schedule.next_run = past_time
        self.schedule.save()
        
        # Trigger schedule update
        self.schedule.update_next_run()
        
        # Next run should be in the future
        self.assertGreater(self.schedule.next_run, timezone.now())

    def test_schedule_with_deactivated_workflow(self):
        """Test schedule behavior when workflow is deactivated."""
        # Deactivate workflow
        self.workflow.is_active = False
        self.workflow.save()
        
        # Schedule should not execute
        with patch('apps.workflows.models.WorkflowSchedule.execute') as mock_execute:
            self.schedule.check_and_execute()
            mock_execute.assert_not_called()

    def test_schedule_with_timezone_change(self):
        """Test schedule behavior during timezone changes."""
        # Set schedule to run during DST change
        dst_change_date = datetime(2024, 3, 10, 2, 0, tzinfo=pytz.timezone('America/New_York'))
        
        with patch('django.utils.timezone.now') as mock_now:
            mock_now.return_value = dst_change_date
            
            # Create schedule just before DST change
            schedule = WorkflowSchedule.objects.create(
                name='DST Schedule',
                workflow=self.workflow,
                is_active=True,
                frequency='daily',
                run_at_hour=2,  # Will be affected by DST change
                run_at_minute=30,
                user=self.user
            )
            
            # Verify next run is calculated correctly
            self.assertNotEqual(schedule.next_run.hour, 2)  # Should be adjusted for DST

    def test_concurrent_schedule_execution(self):
        """Test handling of concurrent schedule executions."""
        with patch('apps.workflows.models.WorkflowSchedule.is_executing') as mock_executing:
            # Simulate concurrent execution
            mock_executing.return_value = True
            
            # Attempt to execute
            with patch('apps.workflows.models.WorkflowSchedule.execute') as mock_execute:
                self.schedule.check_and_execute()
                mock_execute.assert_not_called()

    def test_schedule_with_missing_input_data(self):
        """Test schedule execution with missing required input data."""
        # Create workflow that requires specific input
        workflow = Workflow.objects.create(
            name='Input Required Workflow',
            description='Workflow requiring specific input',
            nodes={
                'node1': {
                    'type': 'mock',
                    'data': {'required_input': '{{input.required_field}}'}
                }
            },
            edges={},
            is_active=True,
            user=self.user
        )
        
        # Create schedule without required input
        schedule = WorkflowSchedule.objects.create(
            name='Missing Input Schedule',
            workflow=workflow,
            is_active=True,
            frequency='daily',
            run_at_hour=9,
            run_at_minute=0,
            input_data={},  # Missing required_field
            user=self.user
        )
        
        # Execute should raise validation error
        with self.assertRaises(ValueError):
            schedule.execute()

    def test_schedule_with_max_failures(self):
        """Test schedule behavior after reaching maximum failure count."""
        # Set up schedule with failure tracking
        self.schedule.failure_count = 5  # Assuming max is less than this
        self.schedule.save()
        
        # Attempt to execute
        with patch('apps.workflows.models.WorkflowSchedule.execute') as mock_execute:
            self.schedule.check_and_execute()
            mock_execute.assert_not_called()
            
        # Schedule should be deactivated
        self.schedule.refresh_from_db()
        self.assertFalse(self.schedule.is_active)

    def test_schedule_with_long_running_workflow(self):
        """Test handling of long-running workflow executions."""
        with patch('apps.workflows.engine.WorkflowExecutor.execute_workflow') as mock_execute:
            # Simulate long-running workflow
            mock_execute.side_effect = lambda *args, **kwargs: time.sleep(5)
            
            # Set short timeout
            with self.settings(WORKFLOW_EXECUTION_TIMEOUT=1):
                with self.assertRaises(TimeoutError):
                    self.schedule.execute()

    def test_schedule_cleanup_after_workflow_deletion(self):
        """Test schedule cleanup when associated workflow is deleted."""
        # Delete workflow
        workflow_id = self.workflow.id
        self.workflow.delete()
        
        # Verify schedule was also deleted
        self.assertFalse(
            WorkflowSchedule.objects.filter(workflow_id=workflow_id).exists()
        )

    def test_schedule_with_invalid_run_time(self):
        """Test schedule with invalid run time combinations."""
        # Test invalid hour
        with self.assertRaises(ValueError):
            WorkflowSchedule.objects.create(
                name='Invalid Hour',
                workflow=self.workflow,
                is_active=True,
                frequency='daily',
                run_at_hour=24,  # Invalid hour
                run_at_minute=0,
                user=self.user
            )
        
        # Test invalid minute
        with self.assertRaises(ValueError):
            WorkflowSchedule.objects.create(
                name='Invalid Minute',
                workflow=self.workflow,
                is_active=True,
                frequency='daily',
                run_at_hour=0,
                run_at_minute=60,  # Invalid minute
                user=self.user
            )

    def test_monthly_schedule_with_invalid_day(self):
        """Test monthly schedule with invalid day of month."""
        # Test with invalid day (31 for months with 30 days)
        schedule = WorkflowSchedule.objects.create(
            name='Monthly Schedule',
            workflow=self.workflow,
            is_active=True,
            frequency='monthly',
            run_at_hour=9,
            run_at_minute=0,
            run_on_day_of_month=31,
            user=self.user
        )
        
        # Set next run to April (30 days)
        next_run = datetime(2024, 4, 1, 9, 0, tzinfo=pytz.UTC)
        schedule.next_run = next_run
        schedule.save()
        
        # Update next run - should adjust to last day of April
        schedule.update_next_run()
        self.assertEqual(schedule.next_run.day, 30)

    def test_weekly_schedule_with_invalid_days(self):
        """Test weekly schedule with invalid days configuration."""
        # Test with no days specified
        with self.assertRaises(ValueError):
            WorkflowSchedule.objects.create(
                name='Invalid Weekly',
                workflow=self.workflow,
                is_active=True,
                frequency='weekly',
                run_at_hour=9,
                run_at_minute=0,
                run_on_days=[],  # No days specified
                user=self.user
            )
        
        # Test with invalid day number
        with self.assertRaises(ValueError):
            WorkflowSchedule.objects.create(
                name='Invalid Weekly',
                workflow=self.workflow,
                is_active=True,
                frequency='weekly',
                run_at_hour=9,
                run_at_minute=0,
                run_on_days=[7],  # Invalid day (valid range is 0-6)
                user=self.user
            ) 