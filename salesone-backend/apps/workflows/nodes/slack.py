from typing import Dict, Any, List
from .base import Node
import logging
from apps.services.slack import slack_service

logger = logging.getLogger(__name__)


class SlackNode(Node):
    """
    Node for sending messages to Slack channels.
    """
    node_type = 'slackNode'
    node_description = '슬랙 알림 보내기'
    node_icon = 'message-square'
    node_category = 'communication'
    
    @classmethod
    def get_input_schema(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'default',
                'name': '입력',
                'description': '이전 노드에서 전달된 데이터',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_output_schema(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'success',
                'name': '성공',
                'description': '슬랙 메시지 전송 성공 시 실행됩니다',
                'type': 'any',
            },
            {
                'id': 'error',
                'name': '실패',
                'description': '슬랙 메시지 전송 실패 시 실행됩니다',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_config_options(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'channel',
                'name': '채널',
                'description': '메시지를 보낼 슬랙 채널',
                'type': 'string',
                'required': True,
                'supports_variables': True,
            },
            {
                'id': 'message',
                'name': '메시지',
                'description': '슬랙 메시지 내용',
                'type': 'text',
                'required': True,
                'supports_variables': True,
            },
            {
                'id': 'username',
                'name': '보낸 사람 이름',
                'description': '메시지를 보내는 봇의 표시 이름',
                'type': 'string',
                'default': 'SalesOne Bot',
                'required': False,
                'supports_variables': True,
            },
            {
                'id': 'icon_emoji',
                'name': '아이콘 이모지',
                'description': '메시지에 표시할 이모지 (예: :robot:)',
                'type': 'string',
                'default': ':salesone:',
                'required': False,
            },
            {
                'id': 'attachments',
                'name': '첨부',
                'description': '슬랙 메시지에 추가할 첨부 콘텐츠 (JSON 형식)',
                'type': 'text',
                'required': False,
                'ui_widget': 'code_editor',
                'supports_variables': True,
            },
            {
                'id': 'webhook_url',
                'name': '웹훅 URL',
                'description': '슬랙 Incoming Webhook URL (비워두면 기본 설정 사용)',
                'type': 'string',
                'required': False,
                'secret': True,
            },
        ]
    
    async def execute(self, context: Dict[str, Any], input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Send a Slack message based on the node configuration.
        
        Args:
            context: The workflow execution context
            input_data: Input data from previous nodes
            
        Returns:
            Output data with success or error information
        """
        try:
            # Get configuration values with variable substitution
            channel = self._get_config_value('channel', context, input_data)
            message = self._get_config_value('message', context, input_data)
            username = self._get_config_value('username', context, input_data)
            icon_emoji = self.data.get('icon_emoji')
            attachments = self._get_config_value('attachments', context, input_data)
            webhook_url = self.data.get('webhook_url')
            
            # Send message using the Slack service
            result = slack_service.send_message(
                channel=channel,
                message=message,
                username=username,
                icon_emoji=icon_emoji,
                attachments=attachments,
                webhook_url=webhook_url
            )
            
            if result['success']:
                return {
                    'success': {
                        'message': f"Slack message sent to {channel}",
                        'input_data': input_data,
                        'channel': channel,
                        'response': result
                    }
                }
            else:
                return {
                    'error': {
                        'message': f"Failed to send Slack message: {result['error']}",
                        'input_data': input_data,
                        'response': result
                    }
                }
            
        except Exception as e:
            logger.error(f"Error sending Slack message: {str(e)}")
            return {
                'error': {
                    'message': f"Failed to send Slack message: {str(e)}",
                    'exception': str(e),
                    'input_data': input_data,
                }
            }
    
    def _get_config_value(self, key: str, context: Dict[str, Any], input_data: Dict[str, Any]) -> Any:
        """
        Get a configuration value, processing any variables.
        
        Args:
            key: The configuration key
            context: The workflow execution context
            input_data: Input data from previous nodes
            
        Returns:
            The processed configuration value
        """
        value = self.data.get(key, '')
        
        if isinstance(value, str):
            # Replace customer variables
            if context.get('client'):
                client = context.get('client', {})
                for field, field_value in client.items():
                    if isinstance(field_value, str):
                        value = value.replace(f'{{{{customer.{field}}}}}', field_value)
            
            # Replace user variables
            if context.get('user'):
                user = context.get('user', {})
                for field, field_value in user.items():
                    if isinstance(field_value, str):
                        value = value.replace(f'{{{{user.{field}}}}}', field_value)
            
            # Replace input data variables
            if input_data:
                for k, v in input_data.items():
                    if isinstance(v, str):
                        value = value.replace(f'{{{{input.{k}}}}}', v)
        
        return value
    
    def validate(self) -> bool:
        """
        Validate the Slack node configuration.
        
        Returns:
            True if the configuration is valid, False otherwise
        """
        if not self.data.get('channel'):
            return False
        
        if not self.data.get('message'):
            return False
            
        return True
    
    def get_validation_errors(self) -> List[str]:
        """
        Get validation error messages for the Slack node.
        
        Returns:
            List of error messages
        """
        errors = []
        
        if not self.data.get('channel'):
            errors.append("슬랙 채널을 입력해주세요.")
            
        if not self.data.get('message'):
            errors.append("메시지 내용을 입력해주세요.")
            
        return errors 