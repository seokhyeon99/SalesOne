from .email import EmailNode
from .slack import SlackNode
from .webhook import WebhookNode
from .condition import ConditionNode
from .delay import DelayNode
from .task import TaskNode
from .trigger_node import TriggerNode


# Register all node types with consistent naming (camelCase + 'Node' suffix)
NODE_TYPES = {
    'emailNode': EmailNode,
    'slackNode': SlackNode,
    'webhookNode': WebhookNode,
    'conditionNode': ConditionNode,
    'delayNode': DelayNode,
    'taskNode': TaskNode,
    'triggerNode': TriggerNode,
}


def get_node_type(node_type):
    """
    Get a node class by its type.
    
    Args:
        node_type: The type of the node to get
        
    Returns:
        The node class, or None if not found
    """
    return NODE_TYPES.get(node_type)


def get_all_node_types():
    """
    Get all available node types.
    
    Returns:
        A dictionary of node types
    """
    return NODE_TYPES


def get_node_schemas():
    """
    Get the schemas for all available node types.
    
    Returns:
        A dictionary of node schemas
    """
    return {node_type: node_class.get_schema() for node_type, node_class in NODE_TYPES.items()}
