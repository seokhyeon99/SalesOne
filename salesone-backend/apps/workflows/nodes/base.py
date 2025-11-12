import uuid
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Type


class Node(ABC):
    """
    Base class for all workflow nodes.
    
    This defines the interface that all node implementations must follow.
    """
    
    # Class-level attributes for node registration
    node_type: str = None
    node_description: str = None
    node_icon: str = None
    node_category: str = None
    
    def __init__(self, id: str = None, data: Dict[str, Any] = None):
        """
        Initialize a new node.
        
        Args:
            id: Unique identifier for this node instance
            data: Node configuration data
        """
        self.id = id or str(uuid.uuid4())
        self.data = data or {}
        self.label = self.data.get('label', self.__class__.__name__)
    
    @classmethod
    def get_schema(cls) -> Dict[str, Any]:
        """
        Get the schema definition for this node type.
        
        This describes the inputs, outputs, and configuration options.
        
        Returns:
            Dict containing the node schema
        """
        return {
            'type': cls.node_type,
            'description': cls.node_description,
            'icon': cls.node_icon,
            'category': cls.node_category,
            'inputs': cls.get_input_schema(),
            'outputs': cls.get_output_schema(),
            'configOptions': cls.get_config_options(),
        }
    
    @classmethod
    def get_input_schema(cls) -> List[Dict[str, Any]]:
        """
        Get the schema for this node's inputs.
        
        Returns:
            List of input port definitions
        """
        return [
            {
                'id': 'default',
                'name': 'Default Input',
                'description': 'Default input for the node',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_output_schema(cls) -> List[Dict[str, Any]]:
        """
        Get the schema for this node's outputs.
        
        Returns:
            List of output port definitions
        """
        return [
            {
                'id': 'default',
                'name': 'Default Output',
                'description': 'Default output for the node',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_config_options(cls) -> List[Dict[str, Any]]:
        """
        Get the configuration options for this node.
        
        Returns:
            List of configuration option definitions
        """
        return []
    
    @abstractmethod
    async def execute(self, context: Dict[str, Any], input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute the node's logic.
        
        Args:
            context: The workflow execution context
            input_data: Input data for the node
            
        Returns:
            Output data from the node
        """
        pass
    
    def validate(self) -> bool:
        """
        Validate the node's configuration.
        
        Returns:
            True if the node is properly configured, False otherwise
        """
        return True
    
    def get_validation_errors(self) -> List[str]:
        """
        Get validation error messages if the node is not properly configured.
        
        Returns:
            List of error messages
        """
        return [] 