import json
from unittest import mock
import asyncio
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.workflows.models import Workflow, WorkflowExecution, WorkflowSchedule

User = get_user_model()


class WorkflowViewSetTest(TestCase):
    """Test cases for the WorkflowViewSet."""
    
    def setUp(self):
        """Set up test data."""
        # Create a test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            name='Test User'
        )
        
        # Create another user for testing filtering
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpassword',
            name='Other User'
        )
        
        # Create a test workflow
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={
                'node1': {
                    'type': 'start',
                    'data': {'name': 'Start Node'}
                },
                'node2': {
                    'type': 'email',
                    'data': {'to': 'test@example.com', 'subject': 'Test', 'body': 'Test email'}
                }
            },
            edges={
                'edge1': {
                    'source': {'node': 'node1', 'port': 'output'},
                    'target': {'node': 'node2', 'port': 'input'}
                }
            },
            is_active=True,
            is_template=False,
            user=self.user
        )
        
        # Create a template workflow
        self.template = Workflow.objects.create(
            name='Template Workflow',
            description='A template workflow',
            nodes={},
            edges={},
            is_active=True,
            is_template=True,
            user=self.user
        )
        
        # Create a workflow for the other user
        self.other_workflow = Workflow.objects.create(
            name='Other Workflow',
            description='Another user workflow',
            nodes={},
            edges={},
            is_active=True,
            is_template=False,
            user=self.other_user
        )
        
        # Set up the API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # URLs for API endpoints
        self.list_url = reverse('workflow-list')
        self.detail_url = reverse('workflow-detail', kwargs={'pk': self.workflow.id})
        self.templates_url = reverse('workflow-templates', kwargs={'pk': None})
        self.node_types_url = reverse('workflow-node-types', kwargs={'pk': None})
        self.execute_url = reverse('workflow-execute', kwargs={'pk': self.workflow.id})
        self.execute_directly_url = reverse('workflow-execute-directly', kwargs={'pk': self.workflow.id})
        self.validate_url = reverse('workflow-validate', kwargs={'pk': self.workflow.id})
    
    def test_list_workflows(self):
        """Test listing all workflows for the user."""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should only see the user's workflows
        self.assertEqual(len(response.data), 2)
        
        # Check that the other user's workflow is not in the results
        workflow_ids = [str(workflow['id']) for workflow in response.data]
        self.assertIn(str(self.workflow.id), workflow_ids)
        self.assertIn(str(self.template.id), workflow_ids)
        self.assertNotIn(str(self.other_workflow.id), workflow_ids)
    
    def test_retrieve_workflow(self):
        """Test retrieving a specific workflow."""
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Workflow')
        self.assertEqual(response.data['description'], 'A test workflow')
        self.assertEqual(response.data['is_active'], True)
        self.assertEqual(response.data['is_template'], False)
    
    def test_retrieve_other_user_workflow(self):
        """Test that a user cannot retrieve another user's workflow."""
        url = reverse('workflow-detail', kwargs={'pk': self.other_workflow.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_create_workflow(self):
        """Test creating a new workflow."""
        data = {
            'name': 'New Workflow',
            'description': 'A new workflow',
            'nodes': {'node1': {'type': 'start', 'data': {}}},
            'edges': {},
            'is_active': True,
            'is_template': False
        }
        
        response = self.client.post(self.list_url, data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Workflow')
        self.assertEqual(response.data['description'], 'A new workflow')
        
        # Check that the workflow was assigned to the user
        workflow_id = response.data['id']
        workflow = Workflow.objects.get(id=workflow_id)
        self.assertEqual(workflow.user, self.user)
    
    def test_update_workflow(self):
        """Test updating a workflow."""
        data = {
            'name': 'Updated Workflow',
            'description': 'An updated workflow',
            'is_active': False
        }
        
        response = self.client.patch(self.detail_url, data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Workflow')
        self.assertEqual(response.data['description'], 'An updated workflow')
        self.assertEqual(response.data['is_active'], False)
        
        # Ensure other fields remain the same
        self.assertEqual(response.data['is_template'], False)
        self.assertIn('nodes', response.data)
        self.assertIn('edges', response.data)
    
    def test_delete_workflow(self):
        """Test deleting a workflow."""
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Workflow.objects.filter(id=self.workflow.id).exists())
    
    def test_get_templates(self):
        """Test getting workflow templates."""
        response = self.client.get(self.templates_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Template Workflow')
        self.assertEqual(response.data[0]['is_template'], True)
    
    @mock.patch('apps.workflows.views.get_node_schemas')
    def test_get_node_types(self, mock_get_node_schemas):
        """Test getting node types."""
        mock_get_node_schemas.return_value = {
            'start': {
                'name': 'Start',
                'description': 'Start node',
                'category': 'flow',
                'icon': 'play',
                'input_schema': {},
                'output_schema': {},
                'config_schema': {}
            },
            'email': {
                'name': 'Email',
                'description': 'Email node',
                'category': 'communication',
                'icon': 'mail',
                'input_schema': {},
                'output_schema': {},
                'config_schema': {}
            }
        }
        
        response = self.client.get(self.node_types_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        node_types = [node['type'] for node in response.data]
        self.assertIn('start', node_types)
        self.assertIn('email', node_types)
    
    @mock.patch('apps.workflows.views.execute_workflow')
    def test_execute_workflow(self, mock_execute_workflow):
        """Test executing a workflow."""
        mock_execute_workflow.delay.return_value = None
        
        data = {
            'input_data': {'test_key': 'test_value'}
        }
        
        response = self.client.post(self.execute_url, data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['input_data'], {'test_key': 'test_value'})
        
        # Check that a workflow execution was created
        execution_id = response.data['id']
        execution = WorkflowExecution.objects.get(id=execution_id)
        self.assertEqual(execution.workflow, self.workflow)
        self.assertEqual(execution.status, 'pending')
        self.assertEqual(execution.input_data, {'test_key': 'test_value'})
        
        # Check that the task was queued
        mock_execute_workflow.delay.assert_called_once_with(str(execution.id))
    
    @mock.patch('apps.workflows.views.asyncio')
    def test_execute_directly(self, mock_asyncio):
        """Test executing a workflow directly."""
        mock_result = {'result': 'success'}
        mock_asyncio.run.return_value = mock_result
        
        data = {
            'input_data': {'test_key': 'test_value'}
        }
        
        response = self.client.post(self.execute_directly_url, data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')
        self.assertEqual(response.data['input_data'], {'test_key': 'test_value'})
        self.assertEqual(response.data['output_data'], mock_result)
    
    def test_validate_workflow(self):
        """Test validating a workflow."""
        # First, create a workflow with an isolated node
        isolated_workflow = Workflow.objects.create(
            name='Isolated Node Workflow',
            description='A workflow with an isolated node',
            nodes={
                'node1': {'type': 'start', 'data': {}},
                'node2': {'type': 'process', 'data': {}},
                'isolated': {'type': 'isolated', 'data': {}}
            },
            edges={
                'edge1': {
                    'source': {'node': 'node1', 'port': 'output'},
                    'target': {'node': 'node2', 'port': 'input'}
                }
            },
            is_active=True,
            user=self.user
        )
        
        validate_url = reverse('workflow-validate', kwargs={'pk': isolated_workflow.id})
        
        # Mock the validation result
        with mock.patch('apps.workflows.views.WorkflowExecutor') as mock_executor_class:
            mock_executor = mock.MagicMock()
            mock_executor_class.return_value = mock_executor
            
            # Setup mock nodes and validation
            mock_nodes = {
                'node1': mock.MagicMock(),
                'node2': mock.MagicMock(),
                'isolated': mock.MagicMock()
            }
            
            mock_executor.nodes = mock_nodes
            mock_executor._get_start_nodes.return_value = ['node1']
            
            # Mock node validation to return true for all nodes
            for node in mock_nodes.values():
                node.validate.return_value = True
            
            # Mock the edge data
            mock_executor.edges = {
                'edge1': {
                    'source': {'node': 'node1', 'port': 'output'},
                    'target': {'node': 'node2', 'port': 'input'}
                }
            }
            
            response = self.client.post(validate_url)
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('is_valid', response.data)
            self.assertIn('errors', response.data)
            
            # Should detect the isolated node
            self.assertFalse(response.data['is_valid'])
            self.assertIn('isolated_nodes', response.data['errors'])
            self.assertEqual(mock_executor._get_start_nodes.call_count, 1)


class WorkflowExecutionViewSetTest(TestCase):
    """Test cases for the WorkflowExecutionViewSet."""
    
    def setUp(self):
        """Set up test data."""
        # Create a test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            name='Test User'
        )
        
        # Create another user for testing filtering
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpassword',
            name='Other User'
        )
        
        # Create a test workflow
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={},
            edges={},
            is_active=True,
            user=self.user
        )
        
        # Create a workflow for the other user
        self.other_workflow = Workflow.objects.create(
            name='Other Workflow',
            description='Another user workflow',
            nodes={},
            edges={},
            is_active=True,
            user=self.other_user
        )
        
        # Create workflow executions
        self.execution = WorkflowExecution.objects.create(
            workflow=self.workflow,
            status='pending',
            input_data={'test': 'data'},
            output_data={}
        )
        
        self.other_execution = WorkflowExecution.objects.create(
            workflow=self.other_workflow,
            status='pending',
            input_data={'test': 'data'},
            output_data={}
        )
        
        # Set up the API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # URLs for API endpoints
        self.list_url = reverse('workflow-execution-list')
        self.detail_url = reverse('workflow-execution-detail', kwargs={'pk': self.execution.id})
        self.cancel_url = reverse('workflow-execution-cancel', kwargs={'pk': self.execution.id})
        self.execution_state_url = reverse('workflow-execution-execution-state', kwargs={'pk': self.execution.id})
    
    def test_list_executions(self):
        """Test listing all executions for the user's workflows."""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should only see executions for the user's workflows
        self.assertEqual(len(response.data), 1)
        self.assertEqual(str(response.data[0]['id']), str(self.execution.id))
    
    def test_retrieve_execution(self):
        """Test retrieving a specific execution."""
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data['id']), str(self.execution.id))
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['input_data'], {'test': 'data'})
    
    def test_retrieve_other_user_execution(self):
        """Test that a user cannot retrieve another user's execution."""
        url = reverse('workflow-execution-detail', kwargs={'pk': self.other_execution.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_cancel_execution(self):
        """Test cancelling a workflow execution."""
        response = self.client.post(self.cancel_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'cancelled')
        
        # Check the database
        execution = WorkflowExecution.objects.get(id=self.execution.id)
        self.assertEqual(execution.status, 'cancelled')
        self.assertIsNotNone(execution.completed_at)
    
    def test_cancel_completed_execution(self):
        """Test that a completed execution cannot be cancelled."""
        # Update the execution status
        self.execution.status = 'completed'
        self.execution.save()
        
        response = self.client.post(self.cancel_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
    
    def test_get_execution_state(self):
        """Test getting detailed execution state."""
        # Set some output data with context
        self.execution.output_data = {
            'context': {
                'node_states': {
                    'node1': {'status': 'completed', 'output': {'result': 'success'}}
                },
                'execution_path': ['node1'],
                'errors': []
            },
            'node1.default': {'result': 'success'}
        }
        self.execution.save()
        
        response = self.client.get(self.execution_state_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data['id']), str(self.execution.id))
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['node_states'], 
                         {'node1': {'status': 'completed', 'output': {'result': 'success'}}})
        self.assertEqual(response.data['execution_path'], ['node1'])
        self.assertEqual(response.data['errors'], [])


class WorkflowScheduleViewSetTest(TestCase):
    """Test cases for the WorkflowScheduleViewSet."""
    
    def setUp(self):
        """Set up test data."""
        # Create a test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            name='Test User'
        )
        
        # Create another user for testing filtering
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpassword',
            name='Other User'
        )
        
        # Create a test workflow
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={},
            edges={},
            is_active=True,
            user=self.user
        )
        
        # Create a workflow for the other user
        self.other_workflow = Workflow.objects.create(
            name='Other Workflow',
            description='Another user workflow',
            nodes={},
            edges={},
            is_active=True,
            user=self.other_user
        )
        
        # Create workflow schedules
        self.schedule = WorkflowSchedule.objects.create(
            workflow=self.workflow,
            name='Daily Schedule',
            is_active=True,
            frequency='daily',
            run_at_hour=9,
            run_at_minute=0,
            input_data={'test': 'data'}
        )
        
        self.other_schedule = WorkflowSchedule.objects.create(
            workflow=self.other_workflow,
            name='Other Schedule',
            is_active=True,
            frequency='daily',
            run_at_hour=10,
            run_at_minute=0,
            input_data={'test': 'data'}
        )
        
        # Set up the API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # URLs for API endpoints
        self.list_url = reverse('workflow-schedule-list')
        self.detail_url = reverse('workflow-schedule-detail', kwargs={'pk': self.schedule.id})
        self.toggle_active_url = reverse('workflow-schedule-toggle-active', kwargs={'pk': self.schedule.id})
        self.update_next_run_url = reverse('workflow-schedule-update-next-run', kwargs={'pk': self.schedule.id})
    
    def test_list_schedules(self):
        """Test listing all schedules for the user's workflows."""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should only see schedules for the user's workflows
        self.assertEqual(len(response.data), 1)
        self.assertEqual(str(response.data[0]['id']), str(self.schedule.id))
    
    def test_retrieve_schedule(self):
        """Test retrieving a specific schedule."""
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data['id']), str(self.schedule.id))
        self.assertEqual(response.data['name'], 'Daily Schedule')
        self.assertEqual(response.data['frequency'], 'daily')
        self.assertEqual(response.data['run_at_hour'], 9)
        self.assertEqual(response.data['run_at_minute'], 0)
        self.assertEqual(response.data['input_data'], {'test': 'data'})
    
    def test_retrieve_other_user_schedule(self):
        """Test that a user cannot retrieve another user's schedule."""
        url = reverse('workflow-schedule-detail', kwargs={'pk': self.other_schedule.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_create_schedule(self):
        """Test creating a new schedule."""
        data = {
            'workflow_id': self.workflow.id,
            'name': 'New Schedule',
            'is_active': True,
            'frequency': 'weekly',
            'run_at_hour': 10,
            'run_at_minute': 30,
            'run_on_days': [0, 3],  # Monday and Thursday
            'input_data': {'test': 'new'}
        }
        
        # Mock the task call
        with mock.patch('apps.workflows.serializers.update_workflow_schedule_next_run') as mock_task:
            mock_task.delay.return_value = None
            
            response = self.client.post(self.list_url, data=data, format='json')
            
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(response.data['name'], 'New Schedule')
            self.assertEqual(response.data['frequency'], 'weekly')
            self.assertEqual(response.data['run_at_hour'], 10)
            self.assertEqual(response.data['run_at_minute'], 30)
            self.assertEqual(response.data['run_on_days'], [0, 3])
            self.assertEqual(response.data['input_data'], {'test': 'new'})
            
            # Check that the task was called
            schedule_id = response.data['id']
            mock_task.delay.assert_called_once_with(schedule_id)
    
    def test_update_schedule(self):
        """Test updating a schedule."""
        data = {
            'name': 'Updated Schedule',
            'run_at_hour': 11,
            'run_at_minute': 45
        }
        
        response = self.client.patch(self.detail_url, data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Schedule')
        self.assertEqual(response.data['run_at_hour'], 11)
        self.assertEqual(response.data['run_at_minute'], 45)
        
        # Ensure other fields remain the same
        self.assertEqual(response.data['frequency'], 'daily')
        self.assertEqual(response.data['is_active'], True)
        self.assertEqual(response.data['input_data'], {'test': 'data'})
    
    def test_delete_schedule(self):
        """Test deleting a schedule."""
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WorkflowSchedule.objects.filter(id=self.schedule.id).exists())
    
    @mock.patch('apps.workflows.views.update_workflow_schedule_next_run')
    def test_toggle_active(self, mock_task):
        """Test toggling the active status of a schedule."""
        mock_task.delay.return_value = None
        
        # Initially the schedule is active
        self.assertTrue(self.schedule.is_active)
        
        response = self.client.post(self.toggle_active_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_active'])
        
        # Toggle back to active
        response = self.client.post(self.toggle_active_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_active'])
        
        # The task should have been called when toggling to active
        mock_task.delay.assert_called_with(str(self.schedule.id))
    
    @mock.patch('apps.workflows.views.update_workflow_schedule_next_run')
    def test_update_next_run(self, mock_task):
        """Test updating the next run time."""
        mock_task.delay.return_value = None
        
        response = self.client.post(self.update_next_run_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        
        # The task should have been called
        mock_task.delay.assert_called_once_with(str(self.schedule.id)) 