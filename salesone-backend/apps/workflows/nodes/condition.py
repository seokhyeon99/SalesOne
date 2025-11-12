from typing import Dict, Any, List
from .base import Node
import logging
import re

logger = logging.getLogger(__name__)


class ConditionNode(Node):
    """
    Node for evaluating conditions and branching workflow execution.
    """
    node_type = 'conditionNode'
    node_description = '조건 분기'
    node_icon = 'git-branch'
    node_category = 'logic'
    
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
                'id': 'true',
                'name': '참',
                'description': '조건이 참일 때 실행됩니다',
                'type': 'any',
            },
            {
                'id': 'false',
                'name': '거짓',
                'description': '조건이 거짓일 때 실행됩니다',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_config_options(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'condition_type',
                'name': '조건 유형',
                'description': '조건 체크 방식',
                'type': 'select',
                'options': [
                    {'label': '값 비교', 'value': 'value_comparison'},
                    {'label': '존재 여부 확인', 'value': 'exists_check'},
                    {'label': '배열 포함 여부', 'value': 'array_contains'},
                    {'label': '정규식 매칭', 'value': 'regex_match'},
                    {'label': 'JSON 경로', 'value': 'json_path'},
                    {'label': '고급 표현식', 'value': 'expression'},
                ],
                'default': 'value_comparison',
                'required': True,
            },
            {
                'id': 'left_value',
                'name': '왼쪽 값',
                'description': '비교할 첫 번째 값',
                'type': 'string',
                'required': True,
                'supports_variables': True,
                'conditional': {'field': 'condition_type', 'value': 'value_comparison'},
            },
            {
                'id': 'operator',
                'name': '연산자',
                'description': '비교 연산자',
                'type': 'select',
                'options': [
                    {'label': '같음 (=)', 'value': 'equals'},
                    {'label': '같지 않음 (≠)', 'value': 'not_equals'},
                    {'label': '크다 (>)', 'value': 'greater_than'},
                    {'label': '크거나 같다 (≥)', 'value': 'greater_than_equals'},
                    {'label': '작다 (<)', 'value': 'less_than'},
                    {'label': '작거나 같다 (≤)', 'value': 'less_than_equals'},
                    {'label': '포함', 'value': 'contains'},
                    {'label': '포함하지 않음', 'value': 'not_contains'},
                    {'label': '시작함', 'value': 'starts_with'},
                    {'label': '끝남', 'value': 'ends_with'},
                ],
                'default': 'equals',
                'required': True,
                'conditional': {'field': 'condition_type', 'value': 'value_comparison'},
            },
            {
                'id': 'right_value',
                'name': '오른쪽 값',
                'description': '비교할 두 번째 값',
                'type': 'string',
                'required': True,
                'supports_variables': True,
                'conditional': {'field': 'condition_type', 'value': 'value_comparison'},
            },
            {
                'id': 'check_path',
                'name': '확인할 경로',
                'description': '존재 여부를 확인할 값의 경로',
                'type': 'string',
                'required': True,
                'supports_variables': True,
                'conditional': {'field': 'condition_type', 'value': 'exists_check'},
            },
            {
                'id': 'check_not_exists',
                'name': '존재하지 않을 때 참',
                'description': '체크한 값이 존재하지 않을 때 참으로 평가',
                'type': 'boolean',
                'default': False,
                'conditional': {'field': 'condition_type', 'value': 'exists_check'},
            },
            {
                'id': 'array_path',
                'name': '배열 경로',
                'description': '확인할 배열의 경로',
                'type': 'string',
                'required': True,
                'supports_variables': True,
                'conditional': {'field': 'condition_type', 'value': 'array_contains'},
            },
            {
                'id': 'array_value',
                'name': '확인할 값',
                'description': '배열에 포함 여부를 확인할 값',
                'type': 'string',
                'required': True,
                'supports_variables': True,
                'conditional': {'field': 'condition_type', 'value': 'array_contains'},
            },
            {
                'id': 'not_contains',
                'name': '포함하지 않을 때 참',
                'description': '배열이 값을 포함하지 않을 때 참으로 평가',
                'type': 'boolean',
                'default': False,
                'conditional': {'field': 'condition_type', 'value': 'array_contains'},
            },
            {
                'id': 'regex_value',
                'name': '확인할 값',
                'description': '정규식으로 확인할 값',
                'type': 'string',
                'required': True,
                'supports_variables': True,
                'conditional': {'field': 'condition_type', 'value': 'regex_match'},
            },
            {
                'id': 'regex_pattern',
                'name': '정규식 패턴',
                'description': '사용할 정규식 패턴',
                'type': 'string',
                'required': True,
                'ui_widget': 'code_editor',
                'conditional': {'field': 'condition_type', 'value': 'regex_match'},
            },
            {
                'id': 'not_match',
                'name': '매칭되지 않을 때 참',
                'description': '정규식이 매칭되지 않을 때 참으로 평가',
                'type': 'boolean',
                'default': False,
                'conditional': {'field': 'condition_type', 'value': 'regex_match'},
            },
            {
                'id': 'json_path',
                'name': 'JSON 경로',
                'description': '데이터에서 값을 추출할 JSON 경로',
                'type': 'string',
                'required': True,
                'ui_widget': 'code_editor',
                'conditional': {'field': 'condition_type', 'value': 'json_path'},
            },
            {
                'id': 'expression',
                'name': '표현식',
                'description': '평가할 자바스크립트 표현식',
                'type': 'text',
                'required': True,
                'ui_widget': 'code_editor',
                'conditional': {'field': 'condition_type', 'value': 'expression'},
            },
        ]
    
    async def execute(self, context: Dict[str, Any], input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Evaluate the condition and return the appropriate branch.
        
        Args:
            context: The workflow execution context
            input_data: Input data from previous nodes
            
        Returns:
            Output data with the appropriate branch result
        """
        try:
            input_data = input_data or {}
            condition_type = self.data.get('condition_type', 'value_comparison')
            result = False
            
            if condition_type == 'value_comparison':
                left_value = self._get_config_value('left_value', context, input_data)
                right_value = self._get_config_value('right_value', context, input_data)
                operator = self.data.get('operator', 'equals')
                
                # Try to convert to numbers if possible
                left_num = self._try_convert_to_number(left_value)
                right_num = self._try_convert_to_number(right_value)
                
                # If both are numbers, use numeric comparison
                if left_num is not None and right_num is not None:
                    left_value = left_num
                    right_value = right_num
                
                # Evaluate based on operator
                if operator == 'equals':
                    result = left_value == right_value
                elif operator == 'not_equals':
                    result = left_value != right_value
                elif operator == 'greater_than':
                    result = left_value > right_value
                elif operator == 'greater_than_equals':
                    result = left_value >= right_value
                elif operator == 'less_than':
                    result = left_value < right_value
                elif operator == 'less_than_equals':
                    result = left_value <= right_value
                elif operator == 'contains':
                    result = right_value in left_value if isinstance(left_value, str) else False
                elif operator == 'not_contains':
                    result = right_value not in left_value if isinstance(left_value, str) else True
                elif operator == 'starts_with':
                    result = left_value.startswith(right_value) if isinstance(left_value, str) else False
                elif operator == 'ends_with':
                    result = left_value.endswith(right_value) if isinstance(left_value, str) else False
                
            elif condition_type == 'exists_check':
                check_path = self.data.get('check_path', '')
                check_not_exists = self.data.get('check_not_exists', False)
                
                # Parse the path and check if the value exists
                value_exists = self._get_value_from_path(check_path, context, input_data) is not None
                result = not value_exists if check_not_exists else value_exists
                
            elif condition_type == 'array_contains':
                array_path = self.data.get('array_path', '')
                array_value = self._get_config_value('array_value', context, input_data)
                not_contains = self.data.get('not_contains', False)
                
                # Get the array and check if it contains the value
                array = self._get_value_from_path(array_path, context, input_data)
                if not isinstance(array, list):
                    array = []
                
                contains = array_value in array
                result = not contains if not_contains else contains
                
            elif condition_type == 'regex_match':
                regex_value = self._get_config_value('regex_value', context, input_data)
                regex_pattern = self.data.get('regex_pattern', '')
                not_match = self.data.get('not_match', False)
                
                # Compile the regex and check if it matches
                try:
                    pattern = re.compile(regex_pattern)
                    matches = bool(pattern.search(str(regex_value)))
                    result = not matches if not_match else matches
                except re.error as e:
                    logger.error(f"Invalid regex pattern: {str(e)}")
                    result = False
                
            elif condition_type == 'json_path':
                # Simple implementation for now - in a real system this would use a proper JSON path library
                json_path = self.data.get('json_path', '')
                
                # For now, just check if path resolves to a truthy value
                value = self._get_value_from_path(json_path, context, input_data)
                result = bool(value)
                
            elif condition_type == 'expression':
                # This would be a security risk in production - would need sandboxing
                # For now, just log that we'd evaluate the expression
                expression = self.data.get('expression', '')
                logger.info(f"Would evaluate expression: {expression}")
                
                # Mock result - in a real implementation, we'd evaluate the JavaScript expression
                result = True
            
            # Log the result
            logger.info(f"Condition evaluated to: {result}")
            
            # Return the appropriate branch
            if result:
                return {
                    'true': {
                        'condition_result': True,
                        'input_data': input_data,
                    }
                }
            else:
                return {
                    'false': {
                        'condition_result': False,
                        'input_data': input_data,
                    }
                }
                
        except Exception as e:
            logger.error(f"Error evaluating condition: {str(e)}")
            # Return error via the false branch
            return {
                'false': {
                    'condition_result': False,
                    'error': str(e),
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
        
        # Process variables in the value (simplified version)
        if isinstance(value, str):
            # Handle special variable syntax for input data
            if value.startswith('{{input.') and value.endswith('}}'):
                path = value[8:-2].strip()  # Extract the path inside {{input.xxx}}
                for part in path.split('.'):
                    if not input_data or part not in input_data:
                        return None
                    input_data = input_data[part]
                return input_data
                
            # Handle context variables
            if context.get('client'):
                client = context.get('client', {})
                value = value.replace('{{client.name}}', str(client.get('name', '')))
                value = value.replace('{{client.id}}', str(client.get('id', '')))
                
            if context.get('user'):
                user = context.get('user', {})
                value = value.replace('{{user.name}}', str(user.get('name', '')))
                value = value.replace('{{user.id}}', str(user.get('id', '')))
                
        return value
    
    def _get_value_from_path(self, path: str, context: Dict[str, Any], input_data: Dict[str, Any]) -> Any:
        """
        Get a value from a path in the execution data.
        
        Args:
            path: The path to the value (e.g., "input.user.email")
            context: The workflow execution context
            input_data: Input data from previous nodes
            
        Returns:
            The value at the path, or None if not found
        """
        if not path:
            return None
            
        # Handle special prefixes
        if path.startswith('input.'):
            parts = path[6:].split('.')
            data = input_data
        elif path.startswith('client.'):
            parts = path[7:].split('.')
            data = context.get('client', {})
        elif path.startswith('user.'):
            parts = path[5:].split('.')
            data = context.get('user', {})
        else:
            # Default to input data
            parts = path.split('.')
            data = input_data
            
        # Traverse the path
        for part in parts:
            if not isinstance(data, dict) or part not in data:
                return None
            data = data[part]
            
        return data
    
    def _try_convert_to_number(self, value: Any) -> Any:
        """
        Try to convert a value to a number.
        
        Args:
            value: The value to convert
            
        Returns:
            The numeric value, or the original value if conversion fails
        """
        if isinstance(value, (int, float)):
            return value
            
        if isinstance(value, str):
            try:
                # Try float first
                if '.' in value:
                    return float(value)
                # Then try int
                return int(value)
            except ValueError:
                pass
                
        return None
    
    def validate(self) -> bool:
        """
        Validate the condition node configuration.
        
        Returns:
            True if the configuration is valid, False otherwise
        """
        condition_type = self.data.get('condition_type', '')
        
        if condition_type == 'value_comparison':
            if not self.data.get('left_value'):
                return False
            if not self.data.get('right_value'):
                return False
            operator = self.data.get('operator', '')
            valid_operators = [
                'equals', 'not_equals', 'greater_than', 'greater_than_equals',
                'less_than', 'less_than_equals', 'contains', 'not_contains',
                'starts_with', 'ends_with'
            ]
            if operator not in valid_operators:
                return False
                
        elif condition_type == 'exists_check':
            if not self.data.get('check_path'):
                return False
                
        elif condition_type == 'array_contains':
            if not self.data.get('array_path'):
                return False
            if 'array_value' not in self.data:
                return False
                
        elif condition_type == 'regex_match':
            if 'regex_value' not in self.data:
                return False
            if not self.data.get('regex_pattern'):
                return False
            # Validate the regex pattern
            try:
                re.compile(self.data.get('regex_pattern', ''))
            except re.error:
                return False
                
        elif condition_type == 'json_path':
            if not self.data.get('json_path'):
                return False
                
        elif condition_type == 'expression':
            if not self.data.get('expression'):
                return False
                
        else:
            return False
            
        return True
    
    def get_validation_errors(self) -> List[str]:
        """
        Get validation error messages for the condition node.
        
        Returns:
            List of error messages
        """
        errors = []
        condition_type = self.data.get('condition_type', '')
        
        if not condition_type:
            errors.append("조건 유형을 선택해주세요.")
            return errors  # Can't validate further without a type
            
        if condition_type == 'value_comparison':
            if not self.data.get('left_value'):
                errors.append("왼쪽 값을 입력해주세요.")
            if not self.data.get('right_value'):
                errors.append("오른쪽 값을 입력해주세요.")
            operator = self.data.get('operator', '')
            valid_operators = [
                'equals', 'not_equals', 'greater_than', 'greater_than_equals',
                'less_than', 'less_than_equals', 'contains', 'not_contains',
                'starts_with', 'ends_with'
            ]
            if operator not in valid_operators:
                errors.append("유효한 연산자를 선택해주세요.")
                
        elif condition_type == 'exists_check':
            if not self.data.get('check_path'):
                errors.append("확인할 경로를 입력해주세요.")
                
        elif condition_type == 'array_contains':
            if not self.data.get('array_path'):
                errors.append("배열 경로를 입력해주세요.")
            if 'array_value' not in self.data:
                errors.append("확인할 값을 입력해주세요.")
                
        elif condition_type == 'regex_match':
            if 'regex_value' not in self.data:
                errors.append("확인할 값을 입력해주세요.")
            if not self.data.get('regex_pattern'):
                errors.append("정규식 패턴을 입력해주세요.")
            else:
                try:
                    re.compile(self.data.get('regex_pattern', ''))
                except re.error as e:
                    errors.append(f"유효하지 않은 정규식 패턴: {str(e)}")
                
        elif condition_type == 'json_path':
            if not self.data.get('json_path'):
                errors.append("JSON 경로를 입력해주세요.")
                
        elif condition_type == 'expression':
            if not self.data.get('expression'):
                errors.append("표현식을 입력해주세요.")
                
        else:
            errors.append("유효하지 않은 조건 유형입니다.")
            
        return errors 