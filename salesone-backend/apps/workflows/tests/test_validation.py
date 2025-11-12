from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.workflows.models import Workflow
from apps.workflows.engine import WorkflowExecutor, NodeRegistry
from apps.workflows.nodes.base import Node

User = get_user_model()

class MockNode(Node):
    """A mock node for testing validation."""
    node_type = "mock"
    node_name = "Mock Node"
    node_description = "A mock node for testing"
    
    def execute(self, context):
        return {"result": "success"}

class WorkflowValidationTest(TestCase):
    """Test cases for workflow validation."""
    
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
        
        # Create a basic valid workflow
        self.workflow = Workflow.objects.create(
            name='Test Workflow',
            description='A test workflow',
            nodes={
                'start': {
                    'type': 'mock',
                    'data': {'param': 'value'}
                },
                'process': {
                    'type': 'mock',
                    'data': {'param': 'value'}
                },
                'end': {
                    'type': 'mock',
                    'data': {'param': 'value'}
                }
            },
            edges={
                'edge1': {
                    'source': {'node': 'start', 'port': 'output'},
                    'target': {'node': 'process', 'port': 'input'}
                },
                'edge2': {
                    'source': {'node': 'process', 'port': 'output'},
                    'target': {'node': 'end', 'port': 'input'}
                }
            },
            is_active=True,
            is_template=False,
            user=self.user
        )
        
        self.executor = WorkflowExecutor(self.registry)

    def test_validate_valid_workflow(self):
        """Test validation of a valid workflow."""
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)

    def test_validate_workflow_with_isolated_node(self):
        """Test validation of a workflow with an isolated node."""
        # Add an isolated node
        self.workflow.nodes['isolated'] = {
            'type': 'mock',
            'data': {'param': 'value'}
        }
        
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertFalse(is_valid)
        self.assertIn('isolated_nodes', errors)
        self.assertIn('isolated', errors['isolated_nodes']['nodes'])

    def test_validate_workflow_with_invalid_node_type(self):
        """Test validation of a workflow with an invalid node type."""
        # Add a node with invalid type
        self.workflow.nodes['invalid'] = {
            'type': 'nonexistent',
            'data': {'param': 'value'}
        }
        self.workflow.edges['edge3'] = {
            'source': {'node': 'end', 'port': 'output'},
            'target': {'node': 'invalid', 'port': 'input'}
        }
        
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertFalse(is_valid)
        self.assertIn('invalid_node_types', errors)
        self.assertIn('nonexistent', errors['invalid_node_types']['types'])

    def test_validate_workflow_with_circular_dependency(self):
        """Test validation of a workflow with circular dependencies."""
        # Create a circular dependency
        self.workflow.edges['edge3'] = {
            'source': {'node': 'end', 'port': 'output'},
            'target': {'node': 'start', 'port': 'input'}
        }
        
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertFalse(is_valid)
        self.assertIn('circular_dependencies', errors)

    def test_validate_workflow_with_missing_node_data(self):
        """Test validation of a workflow with missing required node data."""
        # Remove required data from a node
        self.workflow.nodes['start']['data'] = {}
        
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertFalse(is_valid)
        self.assertIn('invalid_node_data', errors)
        self.assertIn('start', errors['invalid_node_data']['nodes'])

    def test_validate_workflow_with_invalid_edge_references(self):
        """Test validation of a workflow with invalid edge references."""
        # Add an edge referencing a non-existent node
        self.workflow.edges['invalid_edge'] = {
            'source': {'node': 'nonexistent', 'port': 'output'},
            'target': {'node': 'end', 'port': 'input'}
        }
        
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertFalse(is_valid)
        self.assertIn('invalid_edges', errors)
        self.assertIn('invalid_edge', errors['invalid_edges']['edges'])

    def test_validate_workflow_with_duplicate_edges(self):
        """Test validation of a workflow with duplicate edges."""
        # Add a duplicate edge
        self.workflow.edges['edge1_duplicate'] = self.workflow.edges['edge1'].copy()
        
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertFalse(is_valid)
        self.assertIn('duplicate_edges', errors)

    def test_validate_workflow_with_invalid_port_references(self):
        """Test validation of a workflow with invalid port references."""
        # Modify an edge to reference a non-existent port
        self.workflow.edges['edge1']['source']['port'] = 'nonexistent_port'
        
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertFalse(is_valid)
        self.assertIn('invalid_ports', errors)
        self.assertIn('edge1', errors['invalid_ports']['edges'])

    def test_validate_empty_workflow(self):
        """Test validation of an empty workflow."""
        empty_workflow = Workflow.objects.create(
            name='Empty Workflow',
            description='An empty workflow',
            nodes={},
            edges={},
            is_active=True,
            is_template=False,
            user=self.user
        )
        
        is_valid, errors = self.executor.validate_workflow(empty_workflow)
        self.assertFalse(is_valid)
        self.assertIn('empty_workflow', errors)

    def test_validate_workflow_node_limit(self):
        """Test validation of a workflow with too many nodes."""
        # Add many nodes to exceed the limit
        for i in range(100):  # Assuming limit is less than 100
            self.workflow.nodes[f'node_{i}'] = {
                'type': 'mock',
                'data': {'param': 'value'}
            }
        
        is_valid, errors = self.executor.validate_workflow(self.workflow)
        self.assertFalse(is_valid)
        self.assertIn('node_limit_exceeded', errors) 