from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from unittest.mock import patch, MagicMock
import json

from apps.workflows.models import Workflow, WorkflowExecution
from apps.workflows.engine import WorkflowExecutor, NodeRegistry, WorkflowContext
from apps.workflows.nodes.base import Node

User = get_user_model()

class MockNode(Node):
    """A mock node for testing execution state."""
    node_type = "mock"
    node_name = "Mock Node"
    node_description = "A mock node for testing"
    
    def execute(self, context):
        return {"result": "success"}

class MockFailingNode(Node):
    """A mock node that fails during execution."""
    node_type = "mock_fail"
    node_name = "Failing Node"
    node_description = "A node that fails during execution"
    
    def execute(self, context):
        raise ValueError("Simulated failure")

class WorkflowExecutionStateTest(TestCase):
    """Test cases for workflow execution state tracking."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            name='Test User'
        )
        
        # Register mock nodes
        self.registry = NodeRegistry()
        self.registry.register("mock", MockNode)
        self.registry.register("mock_fail", MockFailingNode)
        
        # Create a test workflow with multiple nodes
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={
                'start': {
                    'type': 'mock',
                    'data': {'param': 'start'}
                },
                'process1': {
                    'type': 'mock',
                    'data': {'param': 'process1'}
                },
                'process2': {
                    'type': 'mock',
                    'data': {'param': 'process2'}
                },
                'end': {
                    'type': 'mock',
                    'data': {'param': 'end'}
                }
            },
            edges={
                'edge1': {
                    'source': {'node': 'start', 'port': 'output'},
                    'target': {'node': 'process1', 'port': 'input'}
                },
                'edge2': {
                    'source': {'node': 'process1', 'port': 'output'},
                    'target': {'node': 'process2', 'port': 'input'}
                },
                'edge3': {
                    'source': {'node': 'process2', 'port': 'output'},
                    'target': {'node': 'end', 'port': 'input'}
                }
            },
            is_active=True,
            is_template=False,
            user=self.user
        )
        
        # Create an execution
        self.execution = WorkflowExecution.objects.create(
            workflow=self.workflow,
            status='pending',
            input_data={'test': 'data'},
            user=self.user
        )
        
        self.executor = WorkflowExecutor(self.registry)

    def test_execution_state_tracking(self):
        """Test tracking of execution state through multiple nodes."""
        # Execute workflow
        self.executor.execute_workflow(self.workflow, self.execution)
        
        # Get execution state
        state = self.execution.get_execution_state()
        
        # Verify execution completed successfully
        self.assertEqual(state['status'], 'completed')
        
        # Verify all nodes were executed in order
        self.assertEqual(len(state['execution_path']), 4)
        self.assertEqual(state['execution_path'][0], 'start')
        self.assertEqual(state['execution_path'][-1], 'end')
        
        # Verify node states
        for node_id in ['start', 'process1', 'process2', 'end']:
            self.assertIn(node_id, state['node_states'])
            node_state = state['node_states'][node_id]
            self.assertEqual(node_state['status'], 'completed')
            self.assertIn('start_time', node_state)
            self.assertIn('end_time', node_state)
            self.assertIn('output', node_state)

    def test_execution_state_with_failure(self):
        """Test execution state tracking when a node fails."""
        # Modify workflow to include failing node
        self.workflow.nodes['process1']['type'] = 'mock_fail'
        self.workflow.save()
        
        # Execute workflow
        with self.assertRaises(ValueError):
            self.executor.execute_workflow(self.workflow, self.execution)
        
        # Get execution state
        state = self.execution.get_execution_state()
        
        # Verify execution failed
        self.assertEqual(state['status'], 'failed')
        
        # Verify execution path shows where it failed
        self.assertEqual(len(state['execution_path']), 2)  # start and process1
        self.assertEqual(state['execution_path'][-1], 'process1')
        
        # Verify node states
        self.assertEqual(state['node_states']['start']['status'], 'completed')
        self.assertEqual(state['node_states']['process1']['status'], 'failed')
        self.assertIn('error', state['node_states']['process1'])

    def test_execution_state_persistence(self):
        """Test that execution state is properly persisted."""
        # Execute workflow
        self.executor.execute_workflow(self.workflow, self.execution)
        
        # Reload execution from database
        reloaded_execution = WorkflowExecution.objects.get(id=self.execution.id)
        state = reloaded_execution.get_execution_state()
        
        # Verify state was persisted
        self.assertIsNotNone(state)
        self.assertEqual(state['status'], 'completed')
        self.assertEqual(len(state['execution_path']), 4)

    def test_execution_state_with_input_data(self):
        """Test execution state includes input data transformations."""
        input_data = {'key1': 'value1', 'key2': 'value2'}
        self.execution.input_data = input_data
        self.execution.save()
        
        # Execute workflow
        self.executor.execute_workflow(self.workflow, self.execution)
        
        # Get execution state
        state = self.execution.get_execution_state()
        
        # Verify input data is tracked
        self.assertEqual(state['input_data'], input_data)
        
        # Verify node states include input data
        for node_id in state['node_states']:
            self.assertIn('input_data', state['node_states'][node_id])

    def test_execution_state_with_parallel_branches(self):
        """Test execution state tracking with parallel execution branches."""
        # Modify workflow to include parallel branches
        self.workflow.nodes['parallel1'] = {
            'type': 'mock',
            'data': {'param': 'parallel1'}
        }
        self.workflow.nodes['parallel2'] = {
            'type': 'mock',
            'data': {'param': 'parallel2'}
        }
        self.workflow.edges['edge_parallel1'] = {
            'source': {'node': 'process1', 'port': 'output'},
            'target': {'node': 'parallel1', 'port': 'input'}
        }
        self.workflow.edges['edge_parallel2'] = {
            'source': {'node': 'process1', 'port': 'output'},
            'target': {'node': 'parallel2', 'port': 'input'}
        }
        self.workflow.save()
        
        # Execute workflow
        self.executor.execute_workflow(self.workflow, self.execution)
        
        # Get execution state
        state = self.execution.get_execution_state()
        
        # Verify parallel branches were executed
        self.assertIn('parallel1', state['node_states'])
        self.assertIn('parallel2', state['node_states'])
        
        # Verify execution path includes all nodes
        self.assertEqual(len(set(state['execution_path'])), 6)

    def test_execution_state_with_conditional_branches(self):
        """Test execution state tracking with conditional branches."""
        # Add a condition node and branches
        self.workflow.nodes['condition'] = {
            'type': 'mock',
            'data': {'condition': '{{input.value > 10}}'}
        }
        self.workflow.nodes['branch1'] = {
            'type': 'mock',
            'data': {'param': 'branch1'}
        }
        self.workflow.nodes['branch2'] = {
            'type': 'mock',
            'data': {'param': 'branch2'}
        }
        self.workflow.edges['edge_condition'] = {
            'source': {'node': 'start', 'port': 'output'},
            'target': {'node': 'condition', 'port': 'input'}
        }
        self.workflow.edges['edge_branch1'] = {
            'source': {'node': 'condition', 'port': 'true'},
            'target': {'node': 'branch1', 'port': 'input'}
        }
        self.workflow.edges['edge_branch2'] = {
            'source': {'node': 'condition', 'port': 'false'},
            'target': {'node': 'branch2', 'port': 'input'}
        }
        self.workflow.save()
        
        # Execute workflow with different inputs
        self.execution.input_data = {'value': 15}
        self.execution.save()
        
        self.executor.execute_workflow(self.workflow, self.execution)
        state = self.execution.get_execution_state()
        
        # Verify only the true branch was executed
        self.assertIn('branch1', state['execution_path'])
        self.assertNotIn('branch2', state['execution_path'])

    def test_execution_state_timing_data(self):
        """Test that execution state includes accurate timing data."""
        start_time = timezone.now()
        
        # Execute workflow
        self.executor.execute_workflow(self.workflow, self.execution)
        
        # Get execution state
        state = self.execution.get_execution_state()
        
        # Verify overall execution timing
        self.assertGreaterEqual(state['started_at'], start_time)
        self.assertGreaterEqual(state['completed_at'], state['started_at'])
        self.assertGreater(state['duration'], 0)
        
        # Verify individual node timing
        for node_id, node_state in state['node_states'].items():
            self.assertGreaterEqual(node_state['end_time'], node_state['start_time'])

    def test_execution_state_memory_usage(self):
        """Test execution state tracking with memory usage information."""
        # Execute workflow
        self.executor.execute_workflow(self.workflow, self.execution)
        
        # Get execution state
        state = self.execution.get_execution_state()
        
        # Verify memory usage statistics are tracked
        self.assertIn('memory_usage', state)
        memory_stats = state['memory_usage']
        self.assertIn('peak', memory_stats)
        self.assertIn('average', memory_stats)
        
        # Verify individual node memory usage
        for node_id, node_state in state['node_states'].items():
            self.assertIn('memory_usage', node_state)

    def test_execution_state_with_retries(self):
        """Test execution state tracking with node retries."""
        # Modify a node to fail initially but succeed on retry
        with patch('apps.workflows.nodes.MockNode.execute') as mock_execute:
            mock_execute.side_effect = [
                ValueError("First attempt fails"),
                {"result": "success"}  # Second attempt succeeds
            ]
            
            # Execute workflow with retries enabled
            self.executor.execute_workflow(self.workflow, self.execution, max_retries=1)
            
            # Get execution state
            state = self.execution.get_execution_state()
            
            # Verify retry information is tracked
            node_state = state['node_states']['start']
            self.assertIn('retry_count', node_state)
            self.assertEqual(node_state['retry_count'], 1)
            self.assertIn('retry_history', node_state)
            self.assertEqual(len(node_state['retry_history']), 1) 