from typing import Dict, Any, List
from .base import Node
import logging

logger = logging.getLogger(__name__)


class EmailNode(Node):
    """
    Node for sending emails as part of a workflow.
    """
    node_type = 'emailNode'
    node_description = '이메일 보내기'
    node_icon = 'mail'
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
                'description': '이메일 전송 성공 시 실행됩니다',
                'type': 'any',
            },
            {
                'id': 'error',
                'name': '실패',
                'description': '이메일 전송 실패 시 실행됩니다',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_config_options(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'to',
                'name': '받는 사람',
                'description': '이메일을 받을 주소',
                'type': 'string',
                'required': True,
                'supports_variables': True,
            },
            {
                'id': 'subject',
                'name': '제목',
                'description': '이메일 제목',
                'type': 'string',
                'required': True,
                'supports_variables': True,
            },
            {
                'id': 'body',
                'name': '본문',
                'description': '이메일 내용 (HTML 지원)',
                'type': 'text',
                'required': True,
                'supports_variables': True,
                'ui_widget': 'html_editor',
            },
            {
                'id': 'from_email',
                'name': '보내는 사람',
                'description': '보내는 사람 이메일 주소 (비워두면 기본값 사용)',
                'type': 'string',
                'required': False,
                'supports_variables': True,
            },
            {
                'id': 'cc',
                'name': '참조 (CC)',
                'description': '참조로 추가할 이메일 주소들 (쉼표로 구분)',
                'type': 'string',
                'required': False,
                'supports_variables': True,
            },
            {
                'id': 'bcc',
                'name': '숨은 참조 (BCC)',
                'description': '숨은 참조로 추가할 이메일 주소들 (쉼표로 구분)',
                'type': 'string',
                'required': False,
                'supports_variables': True,
            },
            {
                'id': 'track_opens',
                'name': '열람 추적',
                'description': '이메일 열람 여부를 추적합니다',
                'type': 'boolean',
                'default': True,
            },
            {
                'id': 'track_clicks',
                'name': '클릭 추적',
                'description': '이메일 내 링크 클릭을 추적합니다',
                'type': 'boolean',
                'default': True,
            },
        ]
    
    async def execute(self, context: Dict[str, Any], input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Send an email based on the node configuration.
        
        Args:
            context: The workflow execution context
            input_data: Input data from previous nodes
            
        Returns:
            Output data with success or error information
        """
        try:
            # Get configuration values
            to_email = self._get_config_value('to', context, input_data)
            subject = self._get_config_value('subject', context, input_data)
            body = self._get_config_value('body', context, input_data)
            from_email = self._get_config_value('from_email', context, input_data)
            cc = self._get_config_value('cc', context, input_data)
            bcc = self._get_config_value('bcc', context, input_data)
            track_opens = self.data.get('track_opens', True)
            track_clicks = self.data.get('track_clicks', True)
            
            # For now, just log the email (we'll implement actual sending later)
            logger.info(f"Would send email to: {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"From: {from_email}")
            logger.info(f"CC: {cc}")
            logger.info(f"BCC: {bcc}")
            logger.info(f"Track opens: {track_opens}")
            logger.info(f"Track clicks: {track_clicks}")
            logger.info(f"Body: {body[:100]}...")  # Just log the first 100 chars
            
            # In a real implementation, we would use a service to send the email
            # from apps.services.email import send_email
            # result = send_email(to=to_email, subject=subject, body=body, ...)
            
            # Return success
            return {
                'success': {
                    'message': f"Email sent to {to_email}",
                    'input_data': input_data,
                    'to': to_email,
                    'subject': subject,
                }
            }
            
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            # Return error
            return {
                'error': {
                    'message': f"Failed to send email: {str(e)}",
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
        
        # In a real implementation, we would process any variables in the value
        # e.g., replace {{client.name}} with the actual client name
        # This is a simplified placeholder implementation
        
        if isinstance(value, str):
            # Example variable replacement (to be enhanced later)
            if context.get('client'):
                client = context.get('client', {})
                value = value.replace('{{client.name}}', client.get('name', ''))
                value = value.replace('{{client.email}}', client.get('email', ''))
            
            if context.get('user'):
                user = context.get('user', {})
                value = value.replace('{{user.name}}', user.get('name', ''))
                value = value.replace('{{user.email}}', user.get('email', ''))
                
            # Replace input data variables
            if input_data:
                for k, v in input_data.items():
                    if isinstance(v, str):
                        value = value.replace(f'{{{{input.{k}}}}}', v)
        
        return value
    
    def validate(self) -> bool:
        """
        Validate the email node configuration.
        
        Returns:
            True if the configuration is valid, False otherwise
        """
        if not self.data.get('to'):
            return False
        
        if not self.data.get('subject'):
            return False
            
        if not self.data.get('body'):
            return False
            
        return True
    
    def get_validation_errors(self) -> List[str]:
        """
        Get validation error messages for the email node.
        
        Returns:
            List of error messages
        """
        errors = []
        
        if not self.data.get('to'):
            errors.append("받는 사람 이메일 주소를 입력해주세요.")
            
        if not self.data.get('subject'):
            errors.append("이메일 제목을 입력해주세요.")
            
        if not self.data.get('body'):
            errors.append("이메일 내용을 입력해주세요.")
            
        return errors 