import asyncio
import unittest
from unittest import mock
from django.test import TestCase

from apps.workflows.engine import (
    NodeRegistry, 
    WorkflowContext, 
    WorkflowExecutor, 
    WorkflowExecutionError
)
from apps.workflows.nodes.base import Node
from apps.workflows.models import Workflow, WorkflowExecution


class MockNode(Node):
    """A mock node implementation for testing."""
    node_type = "mock"
    node_name = "Mock Node"
    node_description = "A mock node for testing"
    
    def execute(self, context):
        """Mock execution that simply returns the input."""
        return context.input_data


class NodeRegistryTest(TestCase):
    """Test cases for the NodeRegistry class."""
    
    def setUp(self):
        """Set up test data."""
        self.registry = NodeRegistry()
    
    def test_register_node(self):
        """Test registering a node class."""
        self.registry.register("mock", MockNode)
        self.assertIn("mock", self.registry.nodes)
        self.assertEqual(self.registry.nodes["mock"], MockNode)
    
    def test_get_node_class(self):
        """Test retrieving a node class."""
        self.registry.register("mock", MockNode)
        node_class = self.registry.get_node_class("mock")
        self.assertEqual(node_class, MockNode)
    
    def test_get_unknown_node_class(self):
        """Test retrieving an unknown node class."""
        with self.assertRaises(KeyError):
            self.registry.get_node_class("unknown")


class WorkflowContextTest(TestCase):
    """Test cases for the WorkflowContext class."""
    
    def setUp(self):
        """Set up test data."""
        self.context = WorkflowContext(
            workflow_id="test-workflow",
            execution_id="test-execution",
            input_data={"key": "value"},
            node_results={},
            current_node_id="node1"
        )
    
    def test_context_initialization(self):
        """Test that a context is initialized correctly."""
        self.assertEqual(self.context.workflow_id, "test-workflow")
        self.assertEqual(self.context.execution_id, "test-execution")
        self.assertEqual(self.context.input_data, {"key": "value"})
        self.assertEqual(self.context.node_results, {})
        self.assertEqual(self.context.current_node_id, "node1")
    
    def test_set_node_result(self):
        """Test setting a node result."""
        self.context.set_node_result("node1", {"result": "success"})
        self.assertEqual(self.context.node_results["node1"], {"result": "success"})
    
    def test_get_node_result(self):
        """Test getting a node result."""
        self.context.set_node_result("node1", {"result": "success"})
        result = self.context.get_node_result("node1")
        self.assertEqual(result, {"result": "success"})
    
    def test_get_nonexistent_node_result(self):
        """Test getting a result for a node that hasn't executed."""
        with self.assertRaises(KeyError):
            self.context.get_node_result("node2")


class WorkflowExecutorTest(TestCase):
    """Test cases for the WorkflowExecutor class."""
    
    def setUp(self):
        """Set up test data."""
        self.registry = NodeRegistry()
        self.registry.register("mock", MockNode)
        
        self.workflow = mock.MagicMock(spec=Workflow)
        self.workflow.id = "test-workflow"
        self.workflow.nodes = {
            "node1": {
                "id": "node1",
                "type": "mock",
                "data": {"param1": "value1"}
            }
        }
        self.workflow.edges = {}
        
        self.execution = mock.MagicMock(spec=WorkflowExecution)
        self.execution.id = "test-execution"
        self.execution.input_data = {"input": "test"}
        
        self.executor = WorkflowExecutor(self.registry)
    
    def test_execute_workflow(self):
        """Test executing a workflow."""
        result = self.executor.execute_workflow(self.workflow, self.execution)
        
        # Since we have a single mock node, the result should be the input data
        self.assertEqual(result["node1"], {"input": "test"})
        
    def test_execute_with_invalid_node_type(self):
        """Test executing a workflow with an invalid node type."""
        self.workflow.nodes["node1"]["type"] = "invalid"
        
        with self.assertRaises(WorkflowExecutionError):
            self.executor.execute_workflow(self.workflow, self.execution)
    
    def test_execution_updates_model(self):
        """Test that execution updates the execution model."""
        self.executor.execute_workflow(self.workflow, self.execution)
        
        # Verify that the execution model was updated
        self.execution.result.update.assert_called_once()
        self.execution.status = "completed"
        self.execution.save.assert_called_once() 