from typing import Dict, Any, List
from .base import Node
import logging
import json

logger = logging.getLogger(__name__)


class WebhookNode(Node):
    """
    Node for making HTTP requests as part of a workflow.
    """
    node_type = 'webhookNode'
    node_description = 'API 호출하기'
    node_icon = 'globe'
    node_category = 'integrations'
    
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
                'description': 'API 요청 성공 시 실행됩니다',
                'type': 'any',
            },
            {
                'id': 'error',
                'name': '실패',
                'description': 'API 요청 실패 시 실행됩니다',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_config_options(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'url',
                'name': 'URL',
                'description': '요청을 보낼 URL',
                'type': 'string',
                'required': True,
                'supports_variables': True,
            },
            {
                'id': 'method',
                'name': 'HTTP 메소드',
                'description': 'HTTP 요청 메소드',
                'type': 'select',
                'options': [
                    {'label': 'GET', 'value': 'GET'},
                    {'label': 'POST', 'value': 'POST'},
                    {'label': 'PUT', 'value': 'PUT'},
                    {'label': 'DELETE', 'value': 'DELETE'},
                    {'label': 'PATCH', 'value': 'PATCH'},
                ],
                'default': 'POST',
                'required': True,
            },
            {
                'id': 'headers',
                'name': 'HTTP 헤더',
                'description': 'HTTP 요청 헤더 (JSON 형식)',
                'type': 'text',
                'ui_widget': 'code_editor',
                'default': '{\n  "Content-Type": "application/json"\n}',
                'supports_variables': True,
            },
            {
                'id': 'body',
                'name': '요청 본문',
                'description': 'HTTP 요청 본문 (JSON 형식)',
                'type': 'text',
                'ui_widget': 'code_editor',
                'required': False,
                'supports_variables': True,
            },
            {
                'id': 'query_params',
                'name': '쿼리 파라미터',
                'description': 'URL 쿼리 파라미터 (JSON 형식)',
                'type': 'text',
                'ui_widget': 'code_editor',
                'required': False,
                'supports_variables': True,
            },
            {
                'id': 'timeout',
                'name': '타임아웃',
                'description': '요청 타임아웃 (초)',
                'type': 'number',
                'default': 30,
                'required': False,
            },
            {
                'id': 'authentication',
                'name': '인증',
                'description': '인증 방식',
                'type': 'select',
                'options': [
                    {'label': '없음', 'value': 'none'},
                    {'label': 'Basic Auth', 'value': 'basic'},
                    {'label': 'Bearer Token', 'value': 'bearer'},
                    {'label': 'API Key', 'value': 'api_key'},
                ],
                'default': 'none',
                'required': True,
            },
            {
                'id': 'auth_username',
                'name': '사용자 이름',
                'description': 'Basic Auth 사용자 이름',
                'type': 'string',
                'required': False,
                'conditional': {'field': 'authentication', 'value': 'basic'},
                'secret': True,
            },
            {
                'id': 'auth_password',
                'name': '비밀번호',
                'description': 'Basic Auth 비밀번호',
                'type': 'string',
                'required': False,
                'conditional': {'field': 'authentication', 'value': 'basic'},
                'secret': True,
            },
            {
                'id': 'auth_token',
                'name': '토큰',
                'description': 'Bearer 토큰',
                'type': 'string',
                'required': False,
                'conditional': {'field': 'authentication', 'value': 'bearer'},
                'secret': True,
            },
            {
                'id': 'api_key_name',
                'name': 'API 키 이름',
                'description': 'API 키 헤더 이름',
                'type': 'string',
                'default': 'X-API-Key',
                'required': False,
                'conditional': {'field': 'authentication', 'value': 'api_key'},
            },
            {
                'id': 'api_key_value',
                'name': 'API 키 값',
                'description': 'API 키 값',
                'type': 'string',
                'required': False,
                'conditional': {'field': 'authentication', 'value': 'api_key'},
                'secret': True,
            },
            {
                'id': 'follow_redirects',
                'name': '리다이렉트 따르기',
                'description': 'HTTP 리다이렉트를 자동으로 따릅니다',
                'type': 'boolean',
                'default': True,
                'required': False,
            },
        ]
    
    async def execute(self, context: Dict[str, Any], input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Make an HTTP request based on the node configuration.
        
        Args:
            context: The workflow execution context
            input_data: Input data from previous nodes
            
        Returns:
            Output data with success or error information
        """
        try:
            # Get configuration values
            url = self._get_config_value('url', context, input_data)
            method = self.data.get('method', 'GET')
            headers_str = self._get_config_value('headers', context, input_data)
            body_str = self._get_config_value('body', context, input_data)
            query_params_str = self._get_config_value('query_params', context, input_data)
            timeout = self.data.get('timeout', 30)
            authentication = self.data.get('authentication', 'none')
            follow_redirects = self.data.get('follow_redirects', True)
            
            # Parse JSON strings
            try:
                headers = json.loads(headers_str) if headers_str else {}
            except json.JSONDecodeError:
                logger.warning(f"Invalid headers JSON: {headers_str}")
                headers = {}
                
            try:
                body = json.loads(body_str) if body_str else None
            except json.JSONDecodeError:
                logger.warning(f"Invalid body JSON: {body_str}")
                body = body_str  # Use as raw string if invalid JSON
                
            try:
                query_params = json.loads(query_params_str) if query_params_str else {}
            except json.JSONDecodeError:
                logger.warning(f"Invalid query params JSON: {query_params_str}")
                query_params = {}
            
            # Handle authentication
            if authentication == 'basic':
                auth_username = self.data.get('auth_username', '')
                auth_password = self.data.get('auth_password', '')
                auth = (auth_username, auth_password)
            elif authentication == 'bearer':
                auth_token = self.data.get('auth_token', '')
                headers['Authorization'] = f"Bearer {auth_token}"
                auth = None
            elif authentication == 'api_key':
                api_key_name = self.data.get('api_key_name', 'X-API-Key')
                api_key_value = self.data.get('api_key_value', '')
                headers[api_key_name] = api_key_value
                auth = None
            else:
                auth = None
            
            # For now, just log the request (we'll implement actual API call later)
            logger.info(f"Would make {method} request to: {url}")
            logger.info(f"Headers: {headers}")
            logger.info(f"Auth: {auth is not None}")
            logger.info(f"Query params: {query_params}")
            if method in ['POST', 'PUT', 'PATCH']:
                logger.info(f"Body: {body}")
            logger.info(f"Timeout: {timeout}")
            logger.info(f"Follow redirects: {follow_redirects}")
            
            # In a real implementation, we would use requests to make the API call
            # import requests
            # response = requests.request(
            #     method=method,
            #     url=url,
            #     headers=headers,
            #     json=body if isinstance(body, dict) else None,
            #     data=body if not isinstance(body, dict) else None,
            #     params=query_params,
            #     auth=auth,
            #     timeout=timeout,
            #     allow_redirects=follow_redirects
            # )
            # status_code = response.status_code
            # response_data = response.json() if 'application/json' in response.headers.get('Content-Type', '') else response.text
            
            # Simulate a successful response
            status_code = 200
            response_data = {"message": "Simulated API response"}
            
            # Return success or error based on status code
            if 200 <= status_code < 300:
                return {
                    'success': {
                        'message': f"API request succeeded with status code {status_code}",
                        'status_code': status_code,
                        'data': response_data,
                        'input_data': input_data,
                    }
                }
            else:
                return {
                    'error': {
                        'message': f"API request failed with status code {status_code}",
                        'status_code': status_code,
                        'data': response_data,
                        'input_data': input_data,
                    }
                }
            
        except Exception as e:
            logger.error(f"Error making API request: {str(e)}")
            # Return error
            return {
                'error': {
                    'message': f"Failed to make API request: {str(e)}",
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
        # This is a simplified placeholder implementation
        
        if isinstance(value, str):
            # Example variable replacement (to be enhanced later)
            if context.get('client'):
                client = context.get('client', {})
                value = value.replace('{{client.name}}', str(client.get('name', '')))
                value = value.replace('{{client.id}}', str(client.get('id', '')))
                
            if context.get('user'):
                user = context.get('user', {})
                value = value.replace('{{user.name}}', str(user.get('name', '')))
                value = value.replace('{{user.id}}', str(user.get('id', '')))
                
            # Replace input data variables
            if input_data:
                for k, v in input_data.items():
                    if isinstance(v, str):
                        value = value.replace(f'{{{{input.{k}}}}}', v)
                    elif isinstance(v, (int, float, bool)):
                        value = value.replace(f'{{{{input.{k}}}}}', str(v))
        
        return value
    
    def validate(self) -> bool:
        """
        Validate the webhook node configuration.
        
        Returns:
            True if the configuration is valid, False otherwise
        """
        if not self.data.get('url'):
            return False
            
        method = self.data.get('method', '')
        if method not in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
            return False
            
        # Validate headers JSON
        headers_str = self.data.get('headers', '')
        if headers_str:
            try:
                json.loads(headers_str)
            except json.JSONDecodeError:
                return False
                
        # Validate body JSON
        body_str = self.data.get('body', '')
        if body_str and self.data.get('method') in ['POST', 'PUT', 'PATCH']:
            try:
                json.loads(body_str)
            except json.JSONDecodeError:
                return False
                
        # Validate query params JSON
        query_params_str = self.data.get('query_params', '')
        if query_params_str:
            try:
                json.loads(query_params_str)
            except json.JSONDecodeError:
                return False
                
        # Validate authentication
        authentication = self.data.get('authentication', 'none')
        if authentication == 'basic':
            if not self.data.get('auth_username'):
                return False
            if not self.data.get('auth_password'):
                return False
        elif authentication == 'bearer':
            if not self.data.get('auth_token'):
                return False
        elif authentication == 'api_key':
            if not self.data.get('api_key_name'):
                return False
            if not self.data.get('api_key_value'):
                return False
                
        return True
    
    def get_validation_errors(self) -> List[str]:
        """
        Get validation error messages for the webhook node.
        
        Returns:
            List of error messages
        """
        errors = []
        
        if not self.data.get('url'):
            errors.append("URL을 입력해주세요.")
            
        method = self.data.get('method', '')
        if method not in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
            errors.append("유효한 HTTP 메소드를 선택해주세요.")
            
        # Validate headers JSON
        headers_str = self.data.get('headers', '')
        if headers_str:
            try:
                json.loads(headers_str)
            except json.JSONDecodeError:
                errors.append("헤더는 유효한 JSON 형식이어야 합니다.")
                
        # Validate body JSON
        body_str = self.data.get('body', '')
        if body_str and self.data.get('method') in ['POST', 'PUT', 'PATCH']:
            try:
                json.loads(body_str)
            except json.JSONDecodeError:
                errors.append("요청 본문은 유효한 JSON 형식이어야 합니다.")
                
        # Validate query params JSON
        query_params_str = self.data.get('query_params', '')
        if query_params_str:
            try:
                json.loads(query_params_str)
            except json.JSONDecodeError:
                errors.append("쿼리 파라미터는 유효한 JSON 형식이어야 합니다.")
                
        # Validate authentication
        authentication = self.data.get('authentication', 'none')
        if authentication == 'basic':
            if not self.data.get('auth_username'):
                errors.append("Basic Auth 사용자 이름을 입력해주세요.")
            if not self.data.get('auth_password'):
                errors.append("Basic Auth 비밀번호를 입력해주세요.")
        elif authentication == 'bearer':
            if not self.data.get('auth_token'):
                errors.append("Bearer 토큰을 입력해주세요.")
        elif authentication == 'api_key':
            if not self.data.get('api_key_name'):
                errors.append("API 키 이름을 입력해주세요.")
            if not self.data.get('api_key_value'):
                errors.append("API 키 값을 입력해주세요.")
                
        return errors 