from typing import Dict, Any, List
from .base import Node
import logging

logger = logging.getLogger(__name__)

class TriggerNode(Node):
    """
    Node for triggering workflows with client data.
    """
    node_type = 'triggerNode'
    node_description = '워크플로우 트리거'
    node_icon = 'play'
    node_category = 'triggers'
    
    @classmethod
    def get_input_schema(cls) -> List[Dict[str, Any]]:
        return []  # Trigger nodes don't have inputs
    
    @classmethod
    def get_output_schema(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'default',
                'name': '출력',
                'description': '트리거 데이터',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_config_options(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'client_id',
                'name': '고객',
                'description': '워크플로우를 실행할 고객',
                'type': 'string',
                'required': True,
            },
            {
                'id': 'trigger_data',
                'name': '트리거 데이터',
                'description': '워크플로우에 전달할 추가 데이터',
                'type': 'json',
                'required': False,
            }
        ]
    
    async def execute(self, context: Dict[str, Any], input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute the trigger node.
        
        Args:
            context: The workflow execution context
            input_data: Input data (not used for trigger nodes)
            
        Returns:
            Output data containing client and trigger data
        """
        try:
            # Get client ID from input data, node data, or context in that order
            client_id = None
            if input_data:
                client_id = input_data.get('client_id')
            if not client_id:
                client_id = self.data.get('client_id')
            if not client_id:
                client_id = context.get('client_id')
            
            if not client_id:
                raise ValueError("No client ID provided")
            
            # Get any additional trigger data
            trigger_data = self.data.get('trigger_data', {})
            if input_data:
                trigger_data.update(input_data)
            
            # Return combined data
            return {
                'default': {
                    'client_id': client_id,
                    'trigger_data': trigger_data,
                    **trigger_data  # Spread trigger data for direct access by other nodes
                }
            }
            
        except Exception as e:
            logger.error(f"Error executing trigger node: {str(e)}")
            raise
    
    def validate(self) -> bool:
        """
        Validate the trigger node configuration.
        
        Returns:
            True if the configuration is valid, False otherwise
        """
        # Check for client_id in either node data or input data
        return bool(self.data.get('client_id'))
    
    def get_validation_errors(self) -> List[str]:
        """
        Get validation error messages for the trigger node.
        
        Returns:
            List of error messages
        """
        errors = []
        
        if not self.data.get('client_id'):
            errors.append("고객을 선택해주세요.")
            
        return errors 