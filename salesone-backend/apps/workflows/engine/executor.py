from typing import Dict, Any, List, Optional, Set, Union
import logging
import asyncio
from datetime import datetime
import traceback

from .registry import NodeRegistry
from .context import WorkflowContext
from ..nodes.base import Node

logger = logging.getLogger(__name__)


class WorkflowExecutionError(Exception):
    """
    Exception raised for errors during workflow execution.
    """
    def __init__(self, message: str, node_id: Optional[str] = None, details: Dict[str, Any] = None, is_retriable: bool = False):
        self.message = message
        self.node_id = node_id
        self.details = details or {}
        self.is_retriable = is_retriable
        super().__init__(message)


class WorkflowExecutor:
    """
    Executes workflows by processing their node graphs.
    """
    
    def __init__(self, workflow: Dict[str, Any], context: WorkflowContext = None):
        """
        Initialize a new workflow executor.
        
        Args:
            workflow: The workflow definition to execute
            context: The execution context (optional)
        """
        self.workflow = workflow
        self.context = context or WorkflowContext(workflow=workflow)
        self.registry = NodeRegistry()
        
        # Parse the workflow nodes and edges
        self.nodes = self._parse_nodes(workflow.get('nodes', {}))
        self.edges = self._parse_edges(workflow.get('edges', {}))
        
        # Track execution state
        self.executed_nodes: Set[str] = set()
        self.current_queue: List[str] = []
        self.node_outputs: Dict[str, Dict[str, Any]] = {}
    
    def _parse_nodes(self, nodes_data: Dict[str, Any]) -> Dict[str, Node]:
        """
        Parse the workflow nodes data into Node instances.
        
        Args:
            nodes_data: The nodes data from the workflow definition
            
        Returns:
            Dictionary mapping node IDs to Node instances
            
        Raises:
            WorkflowExecutionError: If a node type is not registered
        """
        parsed_nodes = {}
        
        try:
            for node_id, node_data in nodes_data.items():
                node_type = node_data.get('type')
                if not node_type:
                    raise WorkflowExecutionError(f"Node {node_id} missing 'type' field", node_id=node_id)
                
                # Create the node instance
                node = self.registry.create_node(node_type, node_id, node_data.get('data', {}))
                parsed_nodes[node_id] = node
                
            return parsed_nodes
            
        except ValueError as e:
            raise WorkflowExecutionError(f"Error parsing nodes: {str(e)}")
    
    def _parse_edges(self, edges_data: Union[List[Dict[str, Any]], Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Parse the workflow edges data into a structured format.
        
        Args:
            edges_data: The edges data from the workflow definition (can be list or dict)
            
        Returns:
            Dictionary mapping source node IDs to lists of edge definitions
        """
        parsed_edges: Dict[str, List[Dict[str, Any]]] = {}
        
        # Handle both list and dict formats
        if isinstance(edges_data, list):
            # Handle array format from frontend
            for edge_data in edges_data:
                source = edge_data.get('source')
                target = edge_data.get('target')
                source_handle = edge_data.get('sourceHandle', 'default')
                target_handle = edge_data.get('targetHandle', 'default')
                edge_id = edge_data.get('id')
                
                if not source or not target:
                    logger.warning(f"Edge {edge_id} missing source or target, skipping")
                    continue
                
                if source not in parsed_edges:
                    parsed_edges[source] = []
                    
                parsed_edges[source].append({
                    'id': edge_id,
                    'source': source,
                    'target': target,
                    'sourceHandle': source_handle,
                    'targetHandle': target_handle,
                })
        else:
            # Handle dictionary format (legacy)
            for edge_id, edge_data in edges_data.items():
                source = edge_data.get('source')
                target = edge_data.get('target')
                source_handle = edge_data.get('sourceHandle', 'default')
                target_handle = edge_data.get('targetHandle', 'default')
                
                if not source or not target:
                    logger.warning(f"Edge {edge_id} missing source or target, skipping")
                    continue
                
                if source not in parsed_edges:
                    parsed_edges[source] = []
                    
                parsed_edges[source].append({
                    'id': edge_id,
                    'source': source,
                    'target': target,
                    'sourceHandle': source_handle,
                    'targetHandle': target_handle,
                })
            
        return parsed_edges
    
    def _get_start_nodes(self) -> List[str]:
        """
        Find the start nodes of the workflow (nodes with no incoming edges).
        
        Returns:
            List of start node IDs
        """
        # Get all target nodes (nodes that have incoming edges)
        target_nodes = set()
        for edges in self.edges.values():
            for edge in edges:
                target_nodes.add(edge['target'])
        
        # Start nodes are those that are not targets of any edge
        return [node_id for node_id in self.nodes.keys() if node_id not in target_nodes]
    
    def _get_next_nodes(self, node_id: str, output_port: str) -> List[str]:
        """
        Get the next nodes to execute based on the output of a node.
        
        Args:
            node_id: The ID of the current node
            output_port: The output port to follow
            
        Returns:
            List of next node IDs
        """
        if node_id not in self.edges:
            return []
            
        next_nodes = []
        for edge in self.edges[node_id]:
            if edge['sourceHandle'] == output_port:
                next_nodes.append(edge['target'])
                
        return next_nodes
    
    def _get_input_data(self, node_id: str, input_port: str) -> Dict[str, Any]:
        """
        Get the input data for a node based on its incoming edges.
        
        Args:
            node_id: The ID of the node
            input_port: The input port to get data for
            
        Returns:
            Input data for the node
        """
        input_data = {}
        
        # For trigger nodes or nodes without incoming edges, use the initial input data
        node = self.nodes.get(node_id)
        if node and (node.node_type in ['triggerNode', 'clientTrigger', 'eventTrigger'] or not any(edge['target'] == node_id for edges in self.edges.values() for edge in edges)):
            return self.context.data
        
        # Find all edges that target this node on the given input port
        for source_id, edges in self.edges.items():
            for edge in edges:
                if edge['target'] == node_id and edge['targetHandle'] == input_port:
                    # Get the output data from the source node
                    source_output = self.node_outputs.get(source_id, {})
                    source_port = edge['sourceHandle']
                    
                    if source_port in source_output:
                        # Merge the source output data into the input data
                        port_data = source_output[source_port]
                        if isinstance(port_data, dict) and 'input_data' in port_data:
                            input_data.update(port_data['input_data'])
                            
                        if isinstance(port_data, dict):
                            # Add any direct data from the source output
                            for key, value in port_data.items():
                                if key != 'input_data':
                                    input_data[key] = value
        
        return input_data
    
    async def execute(self) -> Dict[str, Any]:
        """
        Execute the workflow.
        
        Returns:
            Output data from the workflow execution
            
        Raises:
            WorkflowExecutionError: If an error occurs during execution
        """
        try:
            # Find the start nodes
            start_nodes = self._get_start_nodes()
            if not start_nodes:
                raise WorkflowExecutionError("No start nodes found in workflow", is_retriable=False)
                
            logger.info(f"Starting workflow execution with {len(start_nodes)} start nodes")
            
            # Add start nodes to the execution queue
            self.current_queue = start_nodes.copy()
            
            # Process nodes in the queue until it's empty
            while self.current_queue:
                # Get the next node to execute
                node_id = self.current_queue.pop(0)
                
                # Skip if already executed
                if node_id in self.executed_nodes:
                    continue
                    
                # Get the node instance
                if node_id not in self.nodes:
                    self.context.add_error(node_id, f"Node {node_id} not found in workflow")
                    continue
                    
                node = self.nodes[node_id]
                
                # Get input data for the node
                input_data = self._get_input_data(node_id, 'default')
                
                # Execute the node
                await self._execute_node(node, input_data)
                
                # Mark as executed
                self.executed_nodes.add(node_id)
            
            # Check if all nodes were executed
            if len(self.executed_nodes) < len(self.nodes):
                unexecuted = set(self.nodes.keys()) - self.executed_nodes
                logger.warning(f"Not all nodes were executed: {unexecuted}")
            
            # Build the final output
            output = {}
            for node_id, node_output in self.node_outputs.items():
                for port, data in node_output.items():
                    if port != 'error':  # Don't include error outputs in the final result
                        output[f"{node_id}.{port}"] = data
            
            # Mark the execution as complete
            self.context.complete(output)
            
            return output
            
        except Exception as e:
            error_message = str(e)
            stack_trace = traceback.format_exc()
            logger.error(f"Workflow execution error: {error_message}\n{stack_trace}")
            
            # Mark the execution as failed
            self.context.fail(error_message, {'stack_trace': stack_trace})
            
            # Determine if the error is retriable
            is_retriable = isinstance(e, WorkflowExecutionError) and e.is_retriable
            
            raise WorkflowExecutionError(
                f"Workflow execution failed: {error_message}",
                node_id=self.context.current_node_id,
                details={'stack_trace': stack_trace},
                is_retriable=is_retriable
            )
    
    async def _execute_node(self, node: Node, input_data: Dict[str, Any]):
        """
        Execute a single node.
        
        Args:
            node: The node to execute
            input_data: Input data for the node
            
        Raises:
            WorkflowExecutionError: If the node execution fails
        """
        node_id = node.id
        
        try:
            # Set the current node in the context
            self.context.set_node_state(node_id, {
                'start_time': datetime.now().isoformat(),
                'status': 'running',
                'input_data': input_data,
            })
            
            logger.info(f"Executing node {node_id} ({node.node_type})")
            
            # Validate the node
            if not node.validate():
                errors = node.get_validation_errors()
                error_message = "; ".join(errors) if errors else "Node validation failed"
                raise WorkflowExecutionError(f"Node validation failed: {error_message}", node_id=node_id)
            
            # Execute the node
            result = await node.execute(self.context.to_dict(), input_data)
            
            # Store the output
            self.node_outputs[node_id] = result
            
            # Update the node state
            self.context.set_node_state(node_id, {
                'start_time': self.context.get_node_state(node_id).get('start_time'),
                'end_time': datetime.now().isoformat(),
                'status': 'completed',
                'input_data': input_data,
                'output': result,
            })
            
            # Queue next nodes based on the output
            for output_port, output_data in result.items():
                next_nodes = self._get_next_nodes(node_id, output_port)
                for next_node_id in next_nodes:
                    if next_node_id not in self.executed_nodes and next_node_id not in self.current_queue:
                        self.current_queue.append(next_node_id)
            
        except Exception as e:
            error_message = str(e)
            stack_trace = traceback.format_exc()
            logger.error(f"Error executing node {node_id}: {error_message}\n{stack_trace}")
            
            # Update the node state
            self.context.set_node_state(node_id, {
                'start_time': self.context.get_node_state(node_id).get('start_time'),
                'end_time': datetime.now().isoformat(),
                'status': 'failed',
                'input_data': input_data,
                'error': error_message,
                'stack_trace': stack_trace,
            })
            
            # Add the error to the context
            self.context.add_error(node_id, error_message, {
                'stack_trace': stack_trace,
                'node_type': node.node_type,
            })
            
            # Store an error output for the node
            self.node_outputs[node_id] = {
                'error': {
                    'message': error_message,
                    'input_data': input_data,
                }
            }
            
            # Check if we should continue execution
            # For now, we'll continue execution even if a node fails
            # Queue next nodes based on the error output port
            next_nodes = self._get_next_nodes(node_id, 'error')
            for next_node_id in next_nodes:
                if next_node_id not in self.executed_nodes and next_node_id not in self.current_queue:
                    self.current_queue.append(next_node_id) 