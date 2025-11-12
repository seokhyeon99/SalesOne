import uuid
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.workflows.models import Workflow, WorkflowExecution, WorkflowSchedule

User = get_user_model()


class WorkflowModelTest(TestCase):
    """Test cases for the Workflow model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            user=self.user,
            nodes={
                'node1': {
                    'id': 'node1',
                    'type': 'email',
                    'position': {'x': 100, 'y': 100},
                    'data': {'recipient': 'test@example.com', 'subject': 'Test', 'body': 'Test email'}
                }
            },
            edges={
                'edge1': {
                    'id': 'edge1',
                    'source': 'node1',
                    'target': 'node2'
                }
            }
        )
    
    def test_workflow_creation(self):
        """Test that a workflow can be created."""
        self.assertEqual(self.workflow.name, 'Test Workflow')
        self.assertEqual(self.workflow.description, 'A test workflow')
        self.assertEqual(self.workflow.user, self.user)
        self.assertIsNotNone(self.workflow.nodes)
        self.assertIsNotNone(self.workflow.edges)
        self.assertFalse(self.workflow.is_active)
    
    def test_workflow_str(self):
        """Test the string representation of a workflow."""
        self.assertEqual(str(self.workflow), 'Test Workflow')


class WorkflowExecutionTest(TestCase):
    """Test cases for the WorkflowExecution model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            user=self.user,
            nodes={},
            edges={}
        )
        
        self.execution = WorkflowExecution.objects.create(
            workflow=self.workflow,
            status='pending',
            input_data={'key': 'value'},
            output_data={}
        )
    
    def test_execution_creation(self):
        """Test that a workflow execution can be created."""
        self.assertEqual(self.execution.workflow, self.workflow)
        self.assertEqual(self.execution.status, 'pending')
        self.assertEqual(self.execution.input_data, {'key': 'value'})
        self.assertEqual(self.execution.output_data, {})
    
    def test_execution_str(self):
        """Test the string representation of a workflow execution."""
        expected = f"{self.workflow.name} - {self.execution.id}"
        self.assertEqual(str(self.execution), expected)


class WorkflowScheduleTest(TestCase):
    """Test cases for the WorkflowSchedule model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            user=self.user,
            nodes={},
            edges={}
        )
        
        self.schedule = WorkflowSchedule.objects.create(
            workflow=self.workflow,
            name='Test Schedule',
            cron_expression='0 9 * * *',
            input_data={'key': 'value'},
            is_active=True
        )
    
    def test_schedule_creation(self):
        """Test that a workflow schedule can be created."""
        self.assertEqual(self.schedule.workflow, self.workflow)
        self.assertEqual(self.schedule.cron_expression, '0 9 * * *')
        self.assertEqual(self.schedule.input_data, {'key': 'value'})
        self.assertTrue(self.schedule.is_active)
    
    def test_schedule_str(self):
        """Test the string representation of a workflow schedule."""
        expected = f"{self.schedule.name} - {self.workflow.name}"
        self.assertEqual(str(self.schedule), expected)


class WorkflowExecutionModelTest(TestCase):
    """Test cases for the WorkflowExecution model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test2@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={},
            edges={},
            is_active=True,
            user=self.user
        )
        
        self.execution = WorkflowExecution.objects.create(
            workflow=self.workflow,
            status='pending',
            input_data={'test': 'data'},
            output_data={}
        )
    
    def test_execution_creation(self):
        """Test that a workflow execution can be created successfully."""
        self.assertEqual(self.execution.workflow, self.workflow)
        self.assertEqual(self.execution.status, 'pending')
        self.assertEqual(self.execution.input_data, {'test': 'data'})
        self.assertEqual(self.execution.output_data, {})
        self.assertIsNone(self.execution.started_at)
        self.assertIsNone(self.execution.completed_at)
        self.assertTrue(isinstance(self.execution.id, uuid.UUID))
    
    def test_execution_str(self):
        """Test the string representation of a workflow execution."""
        expected = f"{self.workflow.name} - {self.execution.id}"
        self.assertEqual(str(self.execution), expected)
    
    def test_execution_status_update(self):
        """Test updating the execution status."""
        self.execution.status = 'running'
        self.execution.started_at = timezone.now()
        self.execution.save()
        
        updated_execution = WorkflowExecution.objects.get(id=self.execution.id)
        self.assertEqual(updated_execution.status, 'running')
        self.assertIsNotNone(updated_execution.started_at)
        
        updated_execution.status = 'completed'
        updated_execution.completed_at = timezone.now()
        updated_execution.output_data = {'result': 'success'}
        updated_execution.save()
        
        final_execution = WorkflowExecution.objects.get(id=self.execution.id)
        self.assertEqual(final_execution.status, 'completed')
        self.assertIsNotNone(final_execution.completed_at)
        self.assertEqual(final_execution.output_data, {'result': 'success'})


class WorkflowScheduleModelTest(TestCase):
    """Test cases for the WorkflowSchedule model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test3@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={},
            edges={},
            is_active=True,
            user=self.user
        )
        
        self.schedule = WorkflowSchedule.objects.create(
            workflow=self.workflow,
            name='Test Schedule',
            cron_expression='0 9 * * *',
            input_data={'key': 'value'},
            is_active=True
        )
    
    def test_schedule_creation(self):
        """Test that a workflow schedule can be created successfully."""
        self.assertEqual(self.schedule.workflow, self.workflow)
        self.assertEqual(self.schedule.cron_expression, '0 9 * * *')
        self.assertEqual(self.schedule.input_data, {'key': 'value'})
        self.assertTrue(self.schedule.is_active)
    
    def test_schedule_str(self):
        """Test the string representation of a workflow schedule."""
        expected = f"{self.schedule.name} - {self.workflow.name}"
        self.assertEqual(str(self.schedule), expected)
    
    def test_weekly_schedule(self):
        """Test creating a weekly schedule."""
        weekly_schedule = WorkflowSchedule.objects.create(
            workflow=self.workflow,
            name='Weekly Schedule',
            cron_expression='0 9 * * 1',  # Every Monday at 9 AM
            input_data={'key': 'weekly_value'},
            is_active=True
        )
        self.assertEqual(weekly_schedule.cron_expression, '0 9 * * 1')
        self.assertEqual(weekly_schedule.input_data, {'key': 'weekly_value'})
    
    def test_monthly_schedule(self):
        """Test creating a monthly schedule."""
        monthly_schedule = WorkflowSchedule.objects.create(
            workflow=self.workflow,
            name='Monthly Schedule',
            cron_expression='0 9 1 * *',  # First day of every month at 9 AM
            input_data={'key': 'monthly_value'},
            is_active=True
        )
        self.assertEqual(monthly_schedule.cron_expression, '0 9 1 * *')
        self.assertEqual(monthly_schedule.input_data, {'key': 'monthly_value'})
    
    def test_custom_schedule(self):
        """Test creating a custom schedule with cron expression."""
        custom_schedule = WorkflowSchedule.objects.create(
            workflow=self.workflow,
            name='Custom Schedule',
            cron_expression='*/15 * * * *',  # Every 15 minutes
            input_data={'key': 'custom_value'},
            is_active=True
        )
        self.assertEqual(custom_schedule.cron_expression, '*/15 * * * *')
        self.assertEqual(custom_schedule.input_data, {'key': 'custom_value'}) 