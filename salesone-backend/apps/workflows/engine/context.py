from typing import Dict, Any, Optional, List
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class WorkflowContext:
    """
    Context for workflow execution, storing state during the execution process.
    """
    
    def __init__(self, 
                 execution_id: str = None, 
                 workflow: Dict[str, Any] = None, 
                 task: Dict[str, Any] = None,
                 user: Dict[str, Any] = None,
                 client: Dict[str, Any] = None,
                 data: Dict[str, Any] = None):
        """
        Initialize a new workflow execution context.
        
        Args:
            execution_id: ID of the execution
            workflow: The workflow being executed
            task: The task that triggered the workflow (if any)
            user: The user who triggered the workflow
            client: The client associated with the workflow (if any)
            data: Initial data for the execution
        """
        self.execution_id = execution_id or str(uuid.uuid4())
        self.workflow = workflow or {}
        self.task = task or {}
        self.user = user or {}
        self.client = client or {}
        self.data = data or {}
        self.node_states: Dict[str, Dict[str, Any]] = {}
        self.execution_path: List[str] = []
        self.errors: List[Dict[str, Any]] = []
        self.start_time = datetime.now()
        self.end_time: Optional[datetime] = None
        self.output: Dict[str, Any] = {}
        self.current_node_id: Optional[str] = None
        self.status = 'running'
    
    def set_node_state(self, node_id: str, state: Dict[str, Any]):
        """
        Set the state for a node in the execution.
        
        Args:
            node_id: ID of the node
            state: State data for the node
        """
        self.node_states[node_id] = state
        self.execution_path.append(node_id)
        self.current_node_id = node_id
    
    def get_node_state(self, node_id: str) -> Dict[str, Any]:
        """
        Get the state for a node.
        
        Args:
            node_id: ID of the node
            
        Returns:
            State data for the node, or an empty dict if not found
        """
        return self.node_states.get(node_id, {})
    
    def add_error(self, node_id: str, error: str, details: Dict[str, Any] = None):
        """
        Add an error that occurred during execution.
        
        Args:
            node_id: ID of the node where the error occurred
            error: Error message
            details: Additional error details
        """
        self.errors.append({
            'node_id': node_id,
            'error': error,
            'details': details or {},
            'timestamp': datetime.now().isoformat(),
        })
        logger.error(f"Workflow error in node {node_id}: {error}")
    
    def complete(self, output: Dict[str, Any] = None):
        """
        Mark the workflow execution as complete.
        
        Args:
            output: Final output data from the workflow
        """
        self.status = 'completed'
        self.end_time = datetime.now()
        self.output = output or {}
    
    def fail(self, error: str, details: Dict[str, Any] = None):
        """
        Mark the workflow execution as failed.
        
        Args:
            error: Error message
            details: Additional error details
        """
        self.status = 'failed'
        self.end_time = datetime.now()
        if self.current_node_id:
            self.add_error(self.current_node_id, error, details)
        else:
            self.add_error('workflow', error, details)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the context to a dictionary.
        
        Returns:
            Dictionary representation of the context
        """
        return {
            'execution_id': self.execution_id,
            'workflow': self.workflow,
            'task': self.task,
            'user': self.user,
            'client': self.client,
            'data': self.data,
            'node_states': self.node_states,
            'execution_path': self.execution_path,
            'errors': self.errors,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status,
            'output': self.output,
        }
    
    def get_execution_duration(self) -> float:
        """
        Get the duration of the workflow execution in seconds.
        
        Returns:
            Duration in seconds
        """
        end = self.end_time or datetime.now()
        return (end - self.start_time).total_seconds()
    
    def get_execution_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the workflow execution.
        
        Returns:
            Execution statistics
        """
        return {
            'duration': self.get_execution_duration(),
            'node_count': len(self.execution_path),
            'error_count': len(self.errors),
            'status': self.status,
        } 