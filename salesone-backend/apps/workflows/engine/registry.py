from typing import Dict, Type, List, Any
from ..nodes.base import Node
from ..nodes import NODE_TYPES


class NodeRegistry:
    """
    Registry for node types in the workflow engine.
    """
    
    def __init__(self):
        """
        Initialize a new node registry.
        """
        self._nodes: Dict[str, Type[Node]] = {}
        self._register_default_nodes()
    
    def _register_default_nodes(self):
        """
        Register the default node types.
        """
        for node_type, node_class in NODE_TYPES.items():
            self.register(node_type, node_class)
    
    def register(self, node_type: str, node_class: Type[Node]):
        """
        Register a node type.
        
        Args:
            node_type: The type identifier for the node
            node_class: The node class
        """
        if not issubclass(node_class, Node):
            raise ValueError(f"Node class must be a subclass of Node, got {node_class}")
            
        self._nodes[node_type] = node_class
    
    def get(self, node_type: str) -> Type[Node]:
        """
        Get a node class by its type.
        
        Args:
            node_type: The type of node to get
            
        Returns:
            The node class
            
        Raises:
            ValueError: If the node type is not registered
        """
        if node_type not in self._nodes:
            raise ValueError(f"Node type '{node_type}' is not registered")
            
        return self._nodes[node_type]
    
    def create_node(self, node_type: str, node_id: str, data: Dict[str, Any]) -> Node:
        """
        Create a new node instance.
        
        Args:
            node_type: The type of node to create
            node_id: The ID for the new node
            data: Configuration data for the node
            
        Returns:
            A new node instance
            
        Raises:
            ValueError: If the node type is not registered
        """
        node_class = self.get(node_type)
        return node_class(id=node_id, data=data)
    
    def get_all_types(self) -> List[str]:
        """
        Get all registered node types.
        
        Returns:
            List of node types
        """
        return list(self._nodes.keys())
    
    def get_schema(self, node_type: str) -> Dict[str, Any]:
        """
        Get the schema for a node type.
        
        Args:
            node_type: The type of node to get the schema for
            
        Returns:
            The node schema
            
        Raises:
            ValueError: If the node type is not registered
        """
        node_class = self.get(node_type)
        return node_class.get_schema()
    
    def get_all_schemas(self) -> Dict[str, Dict[str, Any]]:
        """
        Get schemas for all registered node types.
        
        Returns:
            Dictionary mapping node types to their schemas
        """
        return {node_type: node_class.get_schema() for node_type, node_class in self._nodes.items()} 