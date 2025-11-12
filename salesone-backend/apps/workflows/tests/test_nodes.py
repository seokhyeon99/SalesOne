from django.test import TestCase
from unittest.mock import patch, MagicMock

from apps.workflows.nodes.base import Node
from apps.workflows.engine import WorkflowContext
from apps.workflows.nodes import EmailNode, SlackNode, HttpRequestNode, DelayNode, SwitchNode


class NodeTestBase(TestCase):
    """Base class for testing workflow nodes."""
    
    def setUp(self):
        """Set up test context."""
        self.context = WorkflowContext()
        self.node_id = "test_node"
        self.upstream_data = {"test_key": "test_value"}
        
        # Store results from upstream node
        self.context.set_node_result("upstream_node", self.upstream_data)


class EmailNodeTest(NodeTestBase):
    """Test case for the EmailNode."""
    
    def setUp(self):
        """Set up test data."""
        super().setUp()
        self.config = {
            "to": "recipient@example.com",
            "subject": "Test Subject",
            "body": "Hello, this is a test email.",
            "from_email": "sender@example.com"
        }
        self.node = EmailNode(self.node_id, self.config)
    
    @patch('apps.workflows.nodes.EmailNode.send_email')
    def test_execute_email_node(self, mock_send_email):
        """Test executing an email node."""
        # Mock the send_email method to avoid actually sending emails
        mock_send_email.return_value = {"status": "sent", "message_id": "test123"}
        
        # Execute the node
        result = self.node.execute(self.context, "upstream_node")
        
        # Verify the node executed correctly
        self.assertIn("status", result)
        self.assertEqual(result["status"], "sent")
        self.assertIn("message_id", result)
        
        # Verify the mock was called with the correct arguments
        mock_send_email.assert_called_once_with(
            to="recipient@example.com",
            subject="Test Subject",
            body="Hello, this is a test email.",
            from_email="sender@example.com"
        )
    
    def test_get_schema(self):
        """Test getting the schema for the email node."""
        schema = EmailNode.get_schema()
        
        # Verify the schema has the expected properties
        self.assertIn("properties", schema)
        self.assertIn("to", schema["properties"])
        self.assertIn("subject", schema["properties"])
        self.assertIn("body", schema["properties"])
        self.assertIn("from_email", schema["properties"])
        
        # Verify required fields are defined
        self.assertIn("required", schema)
        self.assertIn("to", schema["required"])
        self.assertIn("subject", schema["required"])
        self.assertIn("body", schema["required"])


class SlackNodeTest(NodeTestBase):
    """Test case for the SlackNode."""
    
    def setUp(self):
        """Set up test data."""
        super().setUp()
        self.config = {
            "webhook_url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
            "message": "Test message"
        }
        self.node = SlackNode(self.node_id, self.config)
    
    @patch('apps.workflows.nodes.SlackNode.send_slack_message')
    def test_execute_slack_node(self, mock_send_slack):
        """Test executing a Slack node."""
        # Mock the send_slack_message method
        mock_send_slack.return_value = {"ok": True}
        
        # Execute the node
        result = self.node.execute(self.context, "upstream_node")
        
        # Verify the node executed correctly
        self.assertIn("ok", result)
        self.assertTrue(result["ok"])
        
        # Verify the mock was called with the correct arguments
        mock_send_slack.assert_called_once_with(
            webhook_url="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
            message="Test message"
        )


class HttpRequestNodeTest(NodeTestBase):
    """Test case for the HttpRequestNode."""
    
    def setUp(self):
        """Set up test data."""
        super().setUp()
        self.config = {
            "url": "https://api.example.com/data",
            "method": "GET",
            "headers": {"Content-Type": "application/json"},
            "body": "{\"key\": \"value\"}"
        }
        self.node = HttpRequestNode(self.node_id, self.config)
    
    @patch('apps.workflows.nodes.HttpRequestNode.make_request')
    def test_execute_http_request_node(self, mock_make_request):
        """Test executing an HTTP request node."""
        # Mock the make_request method
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"result": "success"}
        mock_response.headers = {"Content-Type": "application/json"}
        mock_make_request.return_value = mock_response
        
        # Execute the node
        result = self.node.execute(self.context, "upstream_node")
        
        # Verify the node executed correctly
        self.assertIn("status_code", result)
        self.assertEqual(result["status_code"], 200)
        self.assertIn("body", result)
        self.assertEqual(result["body"], {"result": "success"})
        self.assertIn("headers", result)
        
        # Verify the mock was called with the correct arguments
        mock_make_request.assert_called_once_with(
            url="https://api.example.com/data",
            method="GET",
            headers={"Content-Type": "application/json"},
            data="{\"key\": \"value\"}"
        )


class DelayNodeTest(NodeTestBase):
    """Test case for the DelayNode."""
    
    def setUp(self):
        """Set up test data."""
        super().setUp()
        self.config = {
            "delay_seconds": 5
        }
        self.node = DelayNode(self.node_id, self.config)
    
    @patch('time.sleep')
    def test_execute_delay_node(self, mock_sleep):
        """Test executing a delay node."""
        # Execute the node
        result = self.node.execute(self.context, "upstream_node")
        
        # Verify the node executed correctly
        self.assertIn("delayed_seconds", result)
        self.assertEqual(result["delayed_seconds"], 5)
        
        # Verify the mock was called with the correct arguments
        mock_sleep.assert_called_once_with(5)


class SwitchNodeTest(NodeTestBase):
    """Test case for the SwitchNode."""
    
    def setUp(self):
        """Set up test data."""
        super().setUp()
        self.config = {
            "field": "test_key",
            "cases": {
                "test_value": "path1",
                "other_value": "path2"
            },
            "default": "default_path"
        }
        self.node = SwitchNode(self.node_id, self.config)
    
    def test_execute_switch_node_matching_case(self):
        """Test executing a switch node with a matching case."""
        # Execute the node
        result = self.node.execute(self.context, "upstream_node")
        
        # Verify the node executed correctly and selected the correct path
        self.assertIn("selected_path", result)
        self.assertEqual(result["selected_path"], "path1")
    
    def test_execute_switch_node_default_case(self):
        """Test executing a switch node with no matching case."""
        # Change the upstream data to trigger the default case
        new_data = {"test_key": "unknown_value"}
        self.context.set_node_result("upstream_node", new_data)
        
        # Execute the node
        result = self.node.execute(self.context, "upstream_node")
        
        # Verify the node executed correctly and selected the default path
        self.assertIn("selected_path", result)
        self.assertEqual(result["selected_path"], "default_path") 