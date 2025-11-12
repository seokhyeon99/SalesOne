# App configuration
default_app_config = 'apps.workflows.apps.WorkflowsConfig'

# Prevent direct model imports at module level to avoid circular dependencies
__all__ = []

# Import engine components to make them available at the module level
from apps.workflows.engine import NodeRegistry, WorkflowContext, WorkflowExecutor, WorkflowExecutionError

# Import node utility functions
from apps.workflows.nodes import get_node_schemas, get_all_node_types, get_node_type

# Note: Models should be imported directly when needed, not at module level
# to prevent circular dependencies during app initialization
