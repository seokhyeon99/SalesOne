from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from apps.workflows.models import Workflow, WorkflowExecution, WorkflowSchedule
from apps.workflows.serializers import (
    WorkflowSerializer,
    WorkflowExecutionSerializer,
    WorkflowScheduleSerializer,
    NodeTypeSerializer
)

User = get_user_model()


class WorkflowSerializerTest(TestCase):
    """Test cases for the WorkflowSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            name='Test User'
        )
        
        self.workflow_data = {
            'name': 'Test Workflow',
            'description': 'A test workflow',
            'nodes': {
                'node1': {
                    'type': 'start',
                    'data': {'name': 'Start Node'}
                }
            },
            'edges': {},
            'is_active': True,
            'is_template': False
        }
        
        self.workflow = Workflow.objects.create(
            **self.workflow_data,
            user=self.user
        )
    
    def test_workflow_serialization(self):
        """Test serializing a Workflow instance."""
        serializer = WorkflowSerializer(self.workflow)
        data = serializer.data
        
        self.assertEqual(data['name'], self.workflow_data['name'])
        self.assertEqual(data['description'], self.workflow_data['description'])
        self.assertEqual(data['nodes'], self.workflow_data['nodes'])
        self.assertEqual(data['edges'], self.workflow_data['edges'])
        self.assertEqual(data['is_active'], self.workflow_data['is_active'])
        self.assertEqual(data['is_template'], self.workflow_data['is_template'])
        self.assertIn('id', data)
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)
    
    def test_workflow_deserialization(self):
        """Test deserializing data to create a Workflow."""
        serializer = WorkflowSerializer(data=self.workflow_data)
        self.assertTrue(serializer.is_valid())
        
        # We don't test save() here since it would need a user
        validated_data = serializer.validated_data
        self.assertEqual(validated_data['name'], self.workflow_data['name'])
        self.assertEqual(validated_data['description'], self.workflow_data['description'])
        self.assertEqual(validated_data['nodes'], self.workflow_data['nodes'])
        self.assertEqual(validated_data['edges'], self.workflow_data['edges'])
        self.assertEqual(validated_data['is_active'], self.workflow_data['is_active'])
        self.assertEqual(validated_data['is_template'], self.workflow_data['is_template'])


class WorkflowExecutionSerializerTest(TestCase):
    """Test cases for the WorkflowExecutionSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            name='Test User'
        )
        
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={},
            edges={},
            is_active=True,
            user=self.user
        )
        
        self.execution_data = {
            'workflow_id': self.workflow.id,
            'input_data': {'test': 'data'}
        }
        
        self.execution = WorkflowExecution.objects.create(
            workflow=self.workflow,
            status='pending',
            input_data=self.execution_data['input_data'],
            output_data={}
        )
    
    def test_execution_serialization(self):
        """Test serializing a WorkflowExecution instance."""
        serializer = WorkflowExecutionSerializer(self.execution)
        data = serializer.data
        
        self.assertEqual(data['workflow']['id'], str(self.workflow.id))
        self.assertEqual(data['status'], 'pending')
        self.assertEqual(data['input_data'], self.execution_data['input_data'])
        self.assertEqual(data['output_data'], {})
        self.assertIsNone(data['task'])
        self.assertIsNone(data['error_message'])
        self.assertIsNone(data['started_at'])
        self.assertIsNone(data['completed_at'])
    
    def test_execution_creation(self):
        """Test creating a new execution from serialized data."""
        serializer = WorkflowExecutionSerializer(data=self.execution_data)
        self.assertTrue(serializer.is_valid())
        
        execution = serializer.save()
        self.assertEqual(execution.workflow, self.workflow)
        self.assertEqual(execution.status, 'pending')
        self.assertEqual(execution.input_data, self.execution_data['input_data'])
        self.assertEqual(execution.output_data, {})


class WorkflowScheduleSerializerTest(TestCase):
    """Test cases for the WorkflowScheduleSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            name='Test User'
        )
        
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={},
            edges={},
            is_active=True,
            user=self.user
        )
        
        self.schedule_data = {
            'workflow_id': self.workflow.id,
            'name': 'Daily Schedule',
            'is_active': True,
            'frequency': 'daily',
            'run_at_hour': 9,
            'run_at_minute': 0,
            'input_data': {'test': 'data'}
        }
        
        self.schedule = WorkflowSchedule.objects.create(
            workflow=self.workflow,
            name=self.schedule_data['name'],
            is_active=self.schedule_data['is_active'],
            frequency=self.schedule_data['frequency'],
            run_at_hour=self.schedule_data['run_at_hour'],
            run_at_minute=self.schedule_data['run_at_minute'],
            input_data=self.schedule_data['input_data']
        )
    
    def test_schedule_serialization(self):
        """Test serializing a WorkflowSchedule instance."""
        serializer = WorkflowScheduleSerializer(self.schedule)
        data = serializer.data
        
        self.assertEqual(data['workflow']['id'], str(self.workflow.id))
        self.assertEqual(data['name'], self.schedule_data['name'])
        self.assertEqual(data['is_active'], self.schedule_data['is_active'])
        self.assertEqual(data['frequency'], self.schedule_data['frequency'])
        self.assertEqual(data['run_at_hour'], self.schedule_data['run_at_hour'])
        self.assertEqual(data['run_at_minute'], self.schedule_data['run_at_minute'])
        self.assertEqual(data['input_data'], self.schedule_data['input_data'])
        self.assertIsNone(data['last_run'])
        self.assertIsNone(data['next_run'])
        self.assertIn('last_run_display', data)
        self.assertIn('next_run_display', data)
    
    def test_schedule_creation(self):
        """Test creating a new schedule from serialized data."""
        # We need to mock the task call for update_workflow_schedule_next_run
        # but for this test we'll focus on serializer behavior
        serializer = WorkflowScheduleSerializer(data=self.schedule_data)
        self.assertTrue(serializer.is_valid())
    
    def test_schedule_validation(self):
        """Test validation rules for schedules."""
        # Test missing run_at_hour for daily frequency
        invalid_data = self.schedule_data.copy()
        invalid_data.pop('run_at_hour')
        
        serializer = WorkflowScheduleSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('run_at_hour', serializer.errors)
        
        # Test invalid hour value
        invalid_data = self.schedule_data.copy()
        invalid_data['run_at_hour'] = 25  # Invalid hour (should be 0-23)
        
        serializer = WorkflowScheduleSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('run_at_hour', serializer.errors)
        
        # Test weekly frequency without run_on_days
        invalid_data = self.schedule_data.copy()
        invalid_data['frequency'] = 'weekly'
        
        serializer = WorkflowScheduleSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('run_on_days', serializer.errors)
        
        # Test monthly frequency without run_on_day_of_month
        invalid_data = self.schedule_data.copy()
        invalid_data['frequency'] = 'monthly'
        
        serializer = WorkflowScheduleSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('run_on_day_of_month', serializer.errors)
        
        # Test custom frequency without cron_expression
        invalid_data = self.schedule_data.copy()
        invalid_data['frequency'] = 'custom'
        
        serializer = WorkflowScheduleSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('cron_expression', serializer.errors)


class NodeTypeSerializerTest(TestCase):
    """Test cases for the NodeTypeSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.node_type_data = {
            'type': 'email',
            'name': 'Email Node',
            'description': 'Sends an email',
            'category': 'communication',
            'icon': 'mail',
            'input_schema': {'type': 'object', 'properties': {}},
            'output_schema': {'type': 'object', 'properties': {}},
            'config_schema': {'type': 'object', 'properties': {}}
        }
        
        self.node_schema_tuple = (
            'email',
            {
                'name': 'Email Node',
                'description': 'Sends an email',
                'category': 'communication',
                'icon': 'mail',
                'input_schema': {'type': 'object', 'properties': {}},
                'output_schema': {'type': 'object', 'properties': {}},
                'config_schema': {'type': 'object', 'properties': {}}
            }
        )
    
    def test_node_type_serialization_from_dict(self):
        """Test serializing a node type from dictionary data."""
        serializer = NodeTypeSerializer(self.node_type_data)
        data = serializer.data
        
        self.assertEqual(data['type'], self.node_type_data['type'])
        self.assertEqual(data['name'], self.node_type_data['name'])
        self.assertEqual(data['description'], self.node_type_data['description'])
        self.assertEqual(data['category'], self.node_type_data['category'])
        self.assertEqual(data['icon'], self.node_type_data['icon'])
        self.assertEqual(data['input_schema'], self.node_type_data['input_schema'])
        self.assertEqual(data['output_schema'], self.node_type_data['output_schema'])
        self.assertEqual(data['config_schema'], self.node_type_data['config_schema'])
    
    def test_node_type_serialization_from_tuple(self):
        """Test serializing a node type from tuple data (type, schema)."""
        serializer = NodeTypeSerializer(self.node_schema_tuple)
        data = serializer.data
        
        self.assertEqual(data['type'], self.node_schema_tuple[0])
        self.assertEqual(data['name'], self.node_schema_tuple[1]['name'])
        self.assertEqual(data['description'], self.node_schema_tuple[1]['description'])
        self.assertEqual(data['category'], self.node_schema_tuple[1]['category'])
        self.assertEqual(data['icon'], self.node_schema_tuple[1]['icon'])
        self.assertEqual(data['input_schema'], self.node_schema_tuple[1]['input_schema'])
        self.assertEqual(data['output_schema'], self.node_schema_tuple[1]['output_schema'])
        self.assertEqual(data['config_schema'], self.node_schema_tuple[1]['config_schema']) 