from typing import Dict, Any, List
from .base import Node
import logging
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)


class TaskNode(Node):
    """
    Node for creating tasks as part of a workflow.
    """
    node_type = 'task'
    node_description = '할일 생성'
    node_icon = 'check-square'
    node_category = 'actions'
    
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
                'description': '할일 생성 성공 시 실행됩니다',
                'type': 'any',
            },
            {
                'id': 'error',
                'name': '실패',
                'description': '할일 생성 실패 시 실행됩니다',
                'type': 'any',
            }
        ]
    
    @classmethod
    def get_config_options(cls) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'name',
                'name': '할일 제목',
                'description': '할일의 제목',
                'type': 'string',
                'required': True,
                'supports_variables': True,
            },
            {
                'id': 'body',
                'name': '할일 내용',
                'description': '할일의 상세 내용',
                'type': 'text',
                'required': True,
                'supports_variables': True,
            },
            {
                'id': 'due_date_type',
                'name': '마감일 설정 방식',
                'description': '마감일을 설정하는 방식',
                'type': 'select',
                'options': [
                    {'label': '특정 날짜', 'value': 'specific_date'},
                    {'label': '현재 기준 상대적', 'value': 'relative'},
                    {'label': '지정 안함', 'value': 'none'},
                ],
                'default': 'relative',
                'required': True,
            },
            {
                'id': 'specific_due_date',
                'name': '마감일',
                'description': '할일의 마감일 (YYYY-MM-DD)',
                'type': 'date',
                'required': True,
                'conditional': {'field': 'due_date_type', 'value': 'specific_date'},
                'supports_variables': True,
            },
            {
                'id': 'relative_days',
                'name': '일수',
                'description': '현재 기준 며칠 후',
                'type': 'number',
                'default': 7,
                'required': True,
                'conditional': {'field': 'due_date_type', 'value': 'relative'},
            },
            {
                'id': 'business_days_only',
                'name': '영업일만 계산',
                'description': '주말(토, 일)을 제외하고 마감일 계산',
                'type': 'boolean',
                'default': False,
                'conditional': {'field': 'due_date_type', 'value': 'relative'},
            },
            {
                'id': 'is_repetitive',
                'name': '반복 할일',
                'description': '할일을 정기적으로 반복',
                'type': 'boolean',
                'default': False,
            },
            {
                'id': 'repetition_interval',
                'name': '반복 간격 (일)',
                'description': '할일이 반복되는 간격 (일 단위)',
                'type': 'number',
                'default': 30,
                'required': True,
                'conditional': {'field': 'is_repetitive', 'value': True},
            },
            {
                'id': 'repetition_end_date_type',
                'name': '반복 종료 방식',
                'description': '반복이 종료되는 방식',
                'type': 'select',
                'options': [
                    {'label': '특정 날짜까지', 'value': 'until_date'},
                    {'label': '횟수', 'value': 'count'},
                    {'label': '종료 없음', 'value': 'never'},
                ],
                'default': 'never',
                'required': True,
                'conditional': {'field': 'is_repetitive', 'value': True},
            },
            {
                'id': 'repetition_end_date',
                'name': '반복 종료일',
                'description': '반복이 종료되는 날짜 (YYYY-MM-DD)',
                'type': 'date',
                'required': True,
                'conditional': {
                    'field': 'repetition_end_date_type',
                    'value': 'until_date',
                },
                'supports_variables': True,
            },
            {
                'id': 'repetition_count',
                'name': '반복 횟수',
                'description': '할일이 반복되는 총 횟수',
                'type': 'number',
                'default': 12,
                'required': True,
                'conditional': {
                    'field': 'repetition_end_date_type',
                    'value': 'count',
                },
            },
            {
                'id': 'assignee_type',
                'name': '담당자 설정 방식',
                'description': '할일 담당자를 설정하는 방식',
                'type': 'select',
                'options': [
                    {'label': '현재 사용자', 'value': 'current_user'},
                    {'label': '특정 사용자', 'value': 'specific_user'},
                    {'label': '고객 담당자', 'value': 'client_owner'},
                ],
                'default': 'current_user',
                'required': True,
            },
            {
                'id': 'assignee_id',
                'name': '담당자 ID',
                'description': '할일을 할당할 사용자의 ID',
                'type': 'string',
                'required': True,
                'conditional': {'field': 'assignee_type', 'value': 'specific_user'},
                'supports_variables': True,
            },
            {
                'id': 'client_id',
                'name': '고객 ID',
                'description': '할일과 연결할 고객 ID',
                'type': 'string',
                'required': False,
                'supports_variables': True,
            },
            {
                'id': 'initial_status',
                'name': '초기 상태',
                'description': '할일의 초기 상태',
                'type': 'select',
                'options': [
                    {'label': '시작 전', 'value': 'not_started'},
                    {'label': '진행 중', 'value': 'in_progress'},
                ],
                'default': 'not_started',
                'required': True,
            },
            {
                'id': 'with_current_workflow',
                'name': '현재 워크플로우 연결',
                'description': '생성된 할일에 현재 실행 중인 워크플로우 연결',
                'type': 'boolean',
                'default': True,
            },
        ]
    
    async def execute(self, context: Dict[str, Any], input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a task based on the node configuration.
        
        Args:
            context: The workflow execution context
            input_data: Input data from previous nodes
            
        Returns:
            Output data with success or error information
        """
        try:
            input_data = input_data or {}
            
            # Get task properties
            name = self._get_config_value('name', context, input_data)
            body = self._get_config_value('body', context, input_data)
            client_id = self._get_config_value('client_id', context, input_data)
            
            # Calculate due date
            due_date = None
            due_date_type = self.data.get('due_date_type', 'relative')
            
            if due_date_type == 'specific_date':
                due_date_str = self._get_config_value('specific_due_date', context, input_data)
                if due_date_str:
                    try:
                        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
                    except ValueError:
                        logger.error(f"Invalid due date format: {due_date_str}")
                        
            elif due_date_type == 'relative':
                days = self.data.get('relative_days', 7)
                business_days_only = self.data.get('business_days_only', False)
                
                today = datetime.now().date()
                if not business_days_only:
                    due_date = today + timedelta(days=days)
                else:
                    # Skip weekends when calculating due date
                    due_date = today
                    remaining_days = days
                    
                    while remaining_days > 0:
                        due_date += timedelta(days=1)
                        if due_date.weekday() < 5:  # 0-4 are weekdays (Monday to Friday)
                            remaining_days -= 1
            
            # Set repetition properties
            is_repetitive = self.data.get('is_repetitive', False)
            repetition_interval = None
            repetition_end_date = None
            
            if is_repetitive:
                repetition_interval = self.data.get('repetition_interval', 30)
                repetition_end_date_type = self.data.get('repetition_end_date_type', 'never')
                
                if repetition_end_date_type == 'until_date':
                    end_date_str = self._get_config_value('repetition_end_date', context, input_data)
                    if end_date_str:
                        try:
                            repetition_end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                        except ValueError:
                            logger.error(f"Invalid repetition end date format: {end_date_str}")
                            
                elif repetition_end_date_type == 'count':
                    count = self.data.get('repetition_count', 12)
                    if due_date and count > 0:
                        repetition_end_date = due_date + timedelta(days=repetition_interval * count)
            
            # Determine assignee
            assignee_id = None
            assignee_type = self.data.get('assignee_type', 'current_user')
            
            if assignee_type == 'current_user':
                assignee_id = context.get('user', {}).get('id')
            elif assignee_type == 'specific_user':
                assignee_id = self._get_config_value('assignee_id', context, input_data)
            elif assignee_type == 'client_owner':
                # In a real implementation, we would get the client's owner
                if client_id:
                    # This is a simplified example - in reality, we would query the client from the database
                    # client = Client.objects.get(id=client_id)
                    # assignee_id = client.owner_id
                    pass
            
            # Set workflow connection
            workflow_ids = []
            workflow_data = {}
            
            if self.data.get('with_current_workflow', True) and context.get('workflow', {}).get('id'):
                workflow_id = context.get('workflow', {}).get('id')
                workflow_ids.append(workflow_id)
                
                # Gather relevant data from context and input data
                workflow_data[workflow_id] = {
                    'input_data': input_data,
                    'context_data': {
                        'client_id': client_id,
                        'execution_id': context.get('execution_id'),
                    }
                }
            
            # Set initial status
            status = self.data.get('initial_status', 'not_started')
            
            # In a real implementation, we would create the task in the database
            # from apps.tasks.models import Task
            # task = Task.objects.create(
            #     name=name,
            #     body=body,
            #     due_date=due_date,
            #     assignee_id=assignee_id,
            #     status=status,
            #     client_id=client_id,
            #     created_by_id=context.get('user', {}).get('id'),
            #     is_repetitive=is_repetitive,
            #     repetition_interval=repetition_interval,
            #     repetition_end_date=repetition_end_date,
            #     workflow_ids=workflow_ids,
            #     workflow_data=workflow_data,
            # )
            # task_id = task.id
            
            # For this example, we just log the task and generate a mock ID
            logger.info(f"Would create task: {name}")
            logger.info(f"Body: {body}")
            logger.info(f"Due date: {due_date}")
            logger.info(f"Assignee ID: {assignee_id}")
            logger.info(f"Status: {status}")
            logger.info(f"Client ID: {client_id}")
            logger.info(f"Is repetitive: {is_repetitive}")
            if is_repetitive:
                logger.info(f"Repetition interval: {repetition_interval}")
                logger.info(f"Repetition end date: {repetition_end_date}")
            logger.info(f"Workflow IDs: {workflow_ids}")
            logger.info(f"Workflow data: {workflow_data}")
            
            task_id = str(uuid.uuid4())
            
            # Return success with task info
            return {
                'success': {
                    'message': f"Task created: {name}",
                    'task_id': task_id,
                    'name': name,
                    'due_date': due_date.isoformat() if due_date else None,
                    'assignee_id': assignee_id,
                    'input_data': input_data,
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating task: {str(e)}")
            # Return error
            return {
                'error': {
                    'message': f"Failed to create task: {str(e)}",
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
                value = value.replace('{{user.email}}', str(user.get('email', '')))
                
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
        Validate the task node configuration.
        
        Returns:
            True if the configuration is valid, False otherwise
        """
        if not self.data.get('name'):
            return False
            
        if not self.data.get('body'):
            return False
            
        due_date_type = self.data.get('due_date_type', '')
        if due_date_type == 'specific_date':
            if not self.data.get('specific_due_date'):
                return False
                
        assignee_type = self.data.get('assignee_type', '')
        if assignee_type == 'specific_user':
            if not self.data.get('assignee_id'):
                return False
                
        is_repetitive = self.data.get('is_repetitive', False)
        if is_repetitive:
            repetition_interval = self.data.get('repetition_interval', 0)
            if repetition_interval <= 0:
                return False
                
            repetition_end_date_type = self.data.get('repetition_end_date_type', '')
            if repetition_end_date_type == 'until_date':
                if not self.data.get('repetition_end_date'):
                    return False
            elif repetition_end_date_type == 'count':
                repetition_count = self.data.get('repetition_count', 0)
                if repetition_count <= 0:
                    return False
                    
        return True
    
    def get_validation_errors(self) -> List[str]:
        """
        Get validation error messages for the task node.
        
        Returns:
            List of error messages
        """
        errors = []
        
        if not self.data.get('name'):
            errors.append("할일 제목을 입력해주세요.")
            
        if not self.data.get('body'):
            errors.append("할일 내용을 입력해주세요.")
            
        due_date_type = self.data.get('due_date_type', '')
        if due_date_type == 'specific_date':
            if not self.data.get('specific_due_date'):
                errors.append("마감일을 입력해주세요.")
                
        assignee_type = self.data.get('assignee_type', '')
        if assignee_type == 'specific_user':
            if not self.data.get('assignee_id'):
                errors.append("담당자 ID를 입력해주세요.")
                
        is_repetitive = self.data.get('is_repetitive', False)
        if is_repetitive:
            repetition_interval = self.data.get('repetition_interval', 0)
            if repetition_interval <= 0:
                errors.append("반복 간격은 0보다 커야 합니다.")
                
            repetition_end_date_type = self.data.get('repetition_end_date_type', '')
            if repetition_end_date_type == 'until_date':
                if not self.data.get('repetition_end_date'):
                    errors.append("반복 종료일을 입력해주세요.")
            elif repetition_end_date_type == 'count':
                repetition_count = self.data.get('repetition_count', 0)
                if repetition_count <= 0:
                    errors.append("반복 횟수는 0보다 커야 합니다.")
                    
        return errors 