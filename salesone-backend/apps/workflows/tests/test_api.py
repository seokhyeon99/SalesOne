from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

from apps.workflows.models import Workflow, WorkflowExecution, WorkflowSchedule


User = get_user_model()


class WorkflowAPITest(TestCase):
    """Test cases for the Workflow API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a test workflow
        self.workflow = Workflow.objects.create(
            name="Test Workflow",
            description="A test workflow",
            created_by=self.user,
            nodes={
                "node1": {
                    "id": "node1",
                    "type": "start",
                    "data": {"title": "Start"}
                },
                "node2": {
                    "id": "node2",
                    "type": "end",
                    "data": {"title": "End"}
                }
            },
            edges={
                "edge1": {
                    "id": "edge1",
                    "source": "node1",
                    "target": "node2"
                }
            }
        )
        
        # URL endpoints
        self.list_url = reverse('workflow-list')
        self.detail_url = reverse('workflow-detail', kwargs={'pk': self.workflow.pk})
        self.execute_url = reverse('workflow-execute', kwargs={'pk': self.workflow.pk})
    
    def test_list_workflows(self):
        """Test listing workflows."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Test Workflow')
    
    def test_retrieve_workflow(self):
        """Test retrieving a single workflow."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Workflow')
        self.assertEqual(response.data['description'], 'A test workflow')
        self.assertEqual(len(response.data['nodes']), 2)
    
    def test_create_workflow(self):
        """Test creating a new workflow."""
        data = {
            'name': 'New Workflow',
            'description': 'A newly created workflow',
            'nodes': {
                'node1': {
                    'id': 'node1',
                    'type': 'start',
                    'data': {'title': 'Start'}
                }
            },
            'edges': {}
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workflow.objects.count(), 2)
        self.assertEqual(response.data['name'], 'New Workflow')
    
    def test_update_workflow(self):
        """Test updating a workflow."""
        data = {
            'name': 'Updated Workflow',
            'description': 'An updated workflow',
            'nodes': self.workflow.nodes,
            'edges': self.workflow.edges
        }
        
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.workflow.refresh_from_db()
        self.assertEqual(self.workflow.name, 'Updated Workflow')
        self.assertEqual(self.workflow.description, 'An updated workflow')
    
    def test_delete_workflow(self):
        """Test deleting a workflow."""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Workflow.objects.count(), 0)
    
    def test_execute_workflow(self):
        """Test executing a workflow."""
        data = {
            'input_data': {'test_key': 'test_value'}
        }
        
        response = self.client.post(self.execute_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('id', response.data)
        self.assertEqual(WorkflowExecution.objects.count(), 1)
        
        # Verify the execution was created with correct data
        execution = WorkflowExecution.objects.first()
        self.assertEqual(execution.workflow, self.workflow)
        self.assertEqual(execution.created_by, self.user)
        self.assertEqual(execution.input_data, {'test_key': 'test_value'})


class WorkflowExecutionAPITest(TestCase):
    """Test cases for the WorkflowExecution API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a test workflow
        self.workflow = Workflow.objects.create(
            name="Test Workflow",
            description="A test workflow",
            created_by=self.user,
            nodes={
                "node1": {
                    "id": "node1",
                    "type": "start",
                    "data": {"title": "Start"}
                }
            },
            edges={}
        )
        
        # Create a test execution
        self.execution = WorkflowExecution.objects.create(
            workflow=self.workflow,
            created_by=self.user,
            status="completed",
            input_data={"key": "value"},
            result={"node1": {"result": "success"}}
        )
        
        # URL endpoints
        self.list_url = reverse('workflow-execution-list')
        self.detail_url = reverse('workflow-execution-detail', kwargs={'pk': self.execution.pk})
    
    def test_list_executions(self):
        """Test listing workflow executions."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'completed')
    
    def test_retrieve_execution(self):
        """Test retrieving a single workflow execution."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')
        self.assertEqual(response.data['input_data'], {"key": "value"})
        self.assertEqual(response.data['result'], {"node1": {"result": "success"}})
    
    def test_filter_executions_by_workflow(self):
        """Test filtering executions by workflow."""
        url = f"{self.list_url}?workflow={self.workflow.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], str(self.execution.id))


class WorkflowScheduleAPITest(TestCase):
    """Test cases for the WorkflowSchedule API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a test workflow
        self.workflow = Workflow.objects.create(
            name="Test Workflow",
            description="A test workflow",
            created_by=self.user,
            nodes={
                "node1": {
                    "id": "node1",
                    "type": "start",
                    "data": {"title": "Start"}
                }
            },
            edges={}
        )
        
        # Create a test schedule
        self.schedule = WorkflowSchedule.objects.create(
            workflow=self.workflow,
            created_by=self.user,
            name="Test Schedule",
            cron_expression="0 9 * * 1-5",  # Weekdays at 9am
            input_data={"scheduled": True},
            is_active=True
        )
        
        # URL endpoints
        self.list_url = reverse('workflow-schedule-list')
        self.detail_url = reverse('workflow-schedule-detail', kwargs={'pk': self.schedule.pk})
    
    def test_list_schedules(self):
        """Test listing workflow schedules."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Test Schedule')
    
    def test_retrieve_schedule(self):
        """Test retrieving a single workflow schedule."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Schedule')
        self.assertEqual(response.data['cron_expression'], '0 9 * * 1-5')
        self.assertEqual(response.data['input_data'], {"scheduled": True})
        self.assertTrue(response.data['is_active'])
    
    def test_create_schedule(self):
        """Test creating a new workflow schedule."""
        data = {
            'workflow': self.workflow.id,
            'name': 'New Schedule',
            'cron_expression': '0 12 * * *',  # Daily at noon
            'input_data': {'new': 'data'},
            'is_active': True
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkflowSchedule.objects.count(), 2)
        self.assertEqual(response.data['name'], 'New Schedule')
        self.assertEqual(response.data['cron_expression'], '0 12 * * *')
    
    def test_update_schedule(self):
        """Test updating a workflow schedule."""
        data = {
            'workflow': self.workflow.id,
            'name': 'Updated Schedule',
            'cron_expression': '0 18 * * *',  # Daily at 6pm
            'input_data': self.schedule.input_data,
            'is_active': False
        }
        
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.schedule.refresh_from_db()
        self.assertEqual(self.schedule.name, 'Updated Schedule')
        self.assertEqual(self.schedule.cron_expression, '0 18 * * *')
        self.assertFalse(self.schedule.is_active)
    
    def test_delete_schedule(self):
        """Test deleting a workflow schedule."""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(WorkflowSchedule.objects.count(), 0)
    
    def test_toggle_active_status(self):
        """Test toggling the active status of a schedule."""
        toggle_url = reverse('workflow-schedule-toggle-active', kwargs={'pk': self.schedule.pk})
        response = self.client.post(toggle_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.schedule.refresh_from_db()
        self.assertFalse(self.schedule.is_active)
        
        # Toggle back to active
        response = self.client.post(toggle_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.schedule.refresh_from_db()
        self.assertTrue(self.schedule.is_active) 