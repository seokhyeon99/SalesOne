from typing import Dict, Any, List
from .base import Node
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class DelayNode(Node):
    """
    Node for adding time delays between workflow steps.
    """
    node_type = 'delayNode'
    node_description = '지연 시간 추가'
    node_icon = 'clock'
    node_category = 'flow'
    
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
                'id': 'default',
                'name': '출력',
                'description': '지연 후 실행됩니다',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_config_options(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'delay_type',
                'name': '지연 유형',
                'description': '지연 시간 지정 방식',
                'type': 'select',
                'options': [
                    {'label': '특정 시간 간격', 'value': 'duration'},
                    {'label': '특정 시간까지', 'value': 'until_time'},
                    {'label': '특정 날짜까지', 'value': 'until_date'},
                ],
                'default': 'duration',
                'required': True,
            },
            {
                'id': 'duration_value',
                'name': '지연 시간 값',
                'description': '지연할 시간의 양',
                'type': 'number',
                'default': 5,
                'required': True,
                'conditional': {'field': 'delay_type', 'value': 'duration'},
            },
            {
                'id': 'duration_unit',
                'name': '지연 시간 단위',
                'description': '지연 시간의 단위',
                'type': 'select',
                'options': [
                    {'label': '초', 'value': 'seconds'},
                    {'label': '분', 'value': 'minutes'},
                    {'label': '시간', 'value': 'hours'},
                    {'label': '일', 'value': 'days'},
                ],
                'default': 'minutes',
                'required': True,
                'conditional': {'field': 'delay_type', 'value': 'duration'},
            },
            {
                'id': 'time_value',
                'name': '시간',
                'description': '지연할 특정 시간 (24시간 형식, HH:MM)',
                'type': 'string',
                'default': '09:00',
                'required': True,
                'conditional': {'field': 'delay_type', 'value': 'until_time'},
            },
            {
                'id': 'date_value',
                'name': '날짜',
                'description': '지연할 특정 날짜 (YYYY-MM-DD)',
                'type': 'date',
                'required': True,
                'conditional': {'field': 'delay_type', 'value': 'until_date'},
            },
            {
                'id': 'time_of_day',
                'name': '시간',
                'description': '특정 날짜의 시간 (24시간 형식, HH:MM)',
                'type': 'string',
                'default': '09:00',
                'required': True,
                'conditional': {'field': 'delay_type', 'value': 'until_date'},
            },
            {
                'id': 'business_days_only',
                'name': '영업일만 계산',
                'description': '주말(토, 일)을 제외하고 계산합니다',
                'type': 'boolean',
                'default': False,
                'conditional': {'field': 'delay_type', 'value': 'duration'},
            },
            {
                'id': 'skip_holidays',
                'name': '공휴일 제외',
                'description': '공휴일을 제외하고 계산합니다',
                'type': 'boolean',
                'default': False,
                'conditional': {'field': 'delay_type', 'value': 'duration'},
            },
        ]
    
    async def execute(self, context: Dict[str, Any], input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Calculate the delay time and return the input data unchanged.
        In a real system, this node would pause execution until the delay time.
        
        Args:
            context: The workflow execution context
            input_data: Input data from previous nodes
            
        Returns:
            The input data unchanged after the delay
        """
        try:
            input_data = input_data or {}
            delay_type = self.data.get('delay_type', 'duration')
            now = datetime.now()
            
            # Calculate the delay time based on the configuration
            if delay_type == 'duration':
                duration_value = self.data.get('duration_value', 5)
                duration_unit = self.data.get('duration_unit', 'minutes')
                business_days_only = self.data.get('business_days_only', False)
                skip_holidays = self.data.get('skip_holidays', False)
                
                # Calculate the delay duration
                if duration_unit == 'seconds':
                    delay = timedelta(seconds=duration_value)
                elif duration_unit == 'minutes':
                    delay = timedelta(minutes=duration_value)
                elif duration_unit == 'hours':
                    delay = timedelta(hours=duration_value)
                elif duration_unit == 'days':
                    delay = timedelta(days=duration_value)
                else:
                    delay = timedelta(minutes=5)  # Default to 5 minutes
                    
                target_time = now + delay
                
                # Handle business days only (simplified)
                if business_days_only:
                    # Add extra days for weekends
                    extra_days = 0
                    current = now
                    while current < target_time:
                        current += timedelta(days=1)
                        if current.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                            extra_days += 1
                    
                    if extra_days > 0:
                        target_time += timedelta(days=extra_days)
                
                # Skip holidays (would need a real holiday calendar)
                if skip_holidays:
                    logger.info("'Skip holidays' is enabled but not implemented in this example")
                
            elif delay_type == 'until_time':
                time_value = self.data.get('time_value', '09:00')
                
                # Parse the time value (HH:MM)
                try:
                    hours, minutes = map(int, time_value.split(':'))
                    target_time = now.replace(hour=hours, minute=minutes, second=0, microsecond=0)
                    
                    # If the time is already past for today, delay until tomorrow
                    if target_time <= now:
                        target_time += timedelta(days=1)
                except ValueError:
                    logger.error(f"Invalid time format: {time_value}")
                    target_time = now + timedelta(minutes=5)  # Default to 5 minutes
                
            elif delay_type == 'until_date':
                date_value = self.data.get('date_value', '')
                time_of_day = self.data.get('time_of_day', '09:00')
                
                # Parse the date and time values
                try:
                    target_date = datetime.strptime(date_value, '%Y-%m-%d').date()
                    hours, minutes = map(int, time_of_day.split(':'))
                    
                    target_time = datetime.combine(target_date, datetime.min.time())
                    target_time = target_time.replace(hour=hours, minute=minutes, second=0, microsecond=0)
                    
                    # If the target time is in the past, just use a short delay
                    if target_time <= now:
                        logger.warning("Target date/time is in the past")
                        target_time = now + timedelta(minutes=5)  # Default to 5 minutes
                except ValueError:
                    logger.error(f"Invalid date/time format: {date_value} {time_of_day}")
                    target_time = now + timedelta(minutes=5)  # Default to 5 minutes
            
            else:
                logger.error(f"Unknown delay type: {delay_type}")
                target_time = now + timedelta(minutes=5)  # Default to 5 minutes
            
            # Calculate the delay in seconds
            delay_seconds = (target_time - now).total_seconds()
            
            # Log the delay info
            logger.info(f"Calculated delay: {delay_seconds:.2f} seconds")
            logger.info(f"Target time: {target_time.isoformat()}")
            
            # In a real implementation, this would pause execution of the workflow
            # for the calculated delay duration. For this example, we just log it.
            
            # Return the input data unchanged
            return {
                'default': {
                    'message': f"Delayed until {target_time.isoformat()}",
                    'delay_seconds': delay_seconds,
                    'input_data': input_data,
                }
            }
            
        except Exception as e:
            logger.error(f"Error in delay node: {str(e)}")
            # Return the input data with an error flag
            return {
                'default': {
                    'error': str(e),
                    'input_data': input_data,
                }
            }
    
    def validate(self) -> bool:
        """
        Validate the delay node configuration.
        
        Returns:
            True if the configuration is valid, False otherwise
        """
        delay_type = self.data.get('delay_type', '')
        
        if delay_type == 'duration':
            if 'duration_value' not in self.data:
                return False
            if self.data.get('duration_value', 0) <= 0:
                return False
            if self.data.get('duration_unit', '') not in ['seconds', 'minutes', 'hours', 'days']:
                return False
                
        elif delay_type == 'until_time':
            time_value = self.data.get('time_value', '')
            if not time_value:
                return False
            try:
                hours, minutes = map(int, time_value.split(':'))
                if hours < 0 or hours > 23 or minutes < 0 or minutes > 59:
                    return False
            except ValueError:
                return False
                
        elif delay_type == 'until_date':
            date_value = self.data.get('date_value', '')
            time_of_day = self.data.get('time_of_day', '')
            
            if not date_value:
                return False
                
            try:
                datetime.strptime(date_value, '%Y-%m-%d')
            except ValueError:
                return False
                
            if not time_of_day:
                return False
                
            try:
                hours, minutes = map(int, time_of_day.split(':'))
                if hours < 0 or hours > 23 or minutes < 0 or minutes > 59:
                    return False
            except ValueError:
                return False
                
        else:
            return False
            
        return True
    
    def get_validation_errors(self) -> List[str]:
        """
        Get validation error messages for the delay node.
        
        Returns:
            List of error messages
        """
        errors = []
        delay_type = self.data.get('delay_type', '')
        
        if not delay_type:
            errors.append("지연 유형을 선택해주세요.")
            return errors  # Can't validate further without a type
            
        if delay_type == 'duration':
            if 'duration_value' not in self.data:
                errors.append("지연 시간 값을 입력해주세요.")
            elif self.data.get('duration_value', 0) <= 0:
                errors.append("지연 시간 값은 0보다 커야 합니다.")
                
            if self.data.get('duration_unit', '') not in ['seconds', 'minutes', 'hours', 'days']:
                errors.append("유효한 지연 시간 단위를 선택해주세요.")
                
        elif delay_type == 'until_time':
            time_value = self.data.get('time_value', '')
            if not time_value:
                errors.append("시간을 입력해주세요.")
            else:
                try:
                    hours, minutes = map(int, time_value.split(':'))
                    if hours < 0 or hours > 23 or minutes < 0 or minutes > 59:
                        errors.append("유효한 시간 형식(HH:MM)을 입력해주세요.")
                except ValueError:
                    errors.append("유효한 시간 형식(HH:MM)을 입력해주세요.")
                
        elif delay_type == 'until_date':
            date_value = self.data.get('date_value', '')
            time_of_day = self.data.get('time_of_day', '')
            
            if not date_value:
                errors.append("날짜를 입력해주세요.")
            else:
                try:
                    datetime.strptime(date_value, '%Y-%m-%d')
                except ValueError:
                    errors.append("유효한 날짜 형식(YYYY-MM-DD)을 입력해주세요.")
                
            if not time_of_day:
                errors.append("시간을 입력해주세요.")
            else:
                try:
                    hours, minutes = map(int, time_of_day.split(':'))
                    if hours < 0 or hours > 23 or minutes < 0 or minutes > 59:
                        errors.append("유효한 시간 형식(HH:MM)을 입력해주세요.")
                except ValueError:
                    errors.append("유효한 시간 형식(HH:MM)을 입력해주세요.")
                
        else:
            errors.append("유효하지 않은 지연 유형입니다.")
            
        return errors 