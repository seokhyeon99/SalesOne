from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.files.base import ContentFile
from apps.clients.models import Client, ClientNote, ClientFile
from apps.tasks.models import Task
import random
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates realistic dummy data for testing'

    def handle(self, *args, **kwargs):
        # Ensure we have a test user
        user, _ = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'first_name': '테스트',
                'last_name': '사용자',
            }
        )
        user.set_password('password123')
        user.save()

        # Create or get test client
        client, _ = Client.objects.get_or_create(
            id=1,
            defaults={
                'user': user,
                'name': '제로커뮤니케이션(주)',
                'representative_name': '유창해',
                'emails': ['admin@zerocommunication.co.kr', 'sales@zerocommunication.co.kr'],
                'phones': ['02-1234-5678', '010-9876-5432'],
                'address': '경기도 고양시 덕양구 통일로 140',
                'website': 'zerocommunication.co.kr',
                'business_number': '123-45-67890'
            }
        )

        # Create notes
        notes_data = [
            {
                'title': '첫 미팅 내용',
                'content': '- 마케팅 예산: 월 500만원\n- 주요 타겟: 20-30대 여성\n- 현재 페이스북/인스타그램 광고 진행 중\n- 내년 1분기 예산 증액 예정\n- 다음 미팅: 2024년 4월 15일'
            },
            {
                'title': '계약 조건 협의',
                'content': '1. 계약기간: 6개월\n2. 월 광고비: 300만원\n3. 성과 리포트: 주 1회 제출\n4. 특이사항: 신규 상품 런칭 예정(5월)'
            },
            {
                'title': '2분기 마케팅 전략',
                'content': '1. SNS 광고 최적화\n2. 검색광고 키워드 확장\n3. 인플루언서 마케팅 기획\n4. 성과 분석 및 예산 조정'
            }
        ]

        for note_data in notes_data:
            ClientNote.objects.get_or_create(
                client=client,
                title=note_data['title'],
                defaults={
                    'user': user,
                    'content': note_data['content']
                }
            )

        # Create tasks
        tasks_data = [
            {
                'name': '월간 리포트 작성',
                'body': '3월 광고 성과 분석 및 리포트 작성\n- 채널별 ROAS 분석\n- 경쟁사 광고 현황\n- 다음 달 예산 제안',
                'due_date': timezone.now() + timedelta(days=5),
                'status': 'not-finished'
            },
            {
                'name': '계약서 갱신',
                'body': '6개월 계약 만료로 인한 재계약 진행\n- 기존 계약 조건 검토\n- 신규 서비스 항목 추가\n- 수정사항 협의',
                'due_date': timezone.now() + timedelta(days=14),
                'status': 'not-finished'
            },
            {
                'name': '신규 캠페인 기획',
                'body': '여름 시즌 프로모션 캠페인 기획\n- 타겟 고객층 분석\n- 경쟁사 캠페인 조사\n- 예산 산출',
                'due_date': timezone.now() + timedelta(days=10),
                'status': 'in-progress'
            },
            {
                'name': '미팅 준비',
                'body': '2분기 성과 보고 미팅 준비\n- 성과 데이터 정리\n- 프레젠테이션 작성\n- 개선안 도출',
                'due_date': timezone.now() + timedelta(days=2),
                'status': 'not-finished'
            }
        ]

        for task_data in tasks_data:
            Task.objects.get_or_create(
                client=client,
                name=task_data['name'],
                defaults={
                    'body': task_data['body'],
                    'due_date': task_data['due_date'],
                    'status': task_data['status'],
                    'assignee': user,
                    'created_by': user
                }
            )

        # Create files
        files_data = [
            {
                'name': '제로커뮤니케이션_계약서_2024.pdf',
                'description': '2024년 마케팅 대행 계약서',
                'content': b'Dummy PDF content'
            },
            {
                'name': '광고집행_리포트_2024_03.xlsx',
                'description': '2024년 3월 광고 성과 보고서',
                'content': b'Dummy Excel content'
            },
            {
                'name': '미팅록_20240401.docx',
                'description': '4월 1일 정기 미팅 회의록',
                'content': b'Dummy Word content'
            }
        ]

        for file_data in files_data:
            file_obj, created = ClientFile.objects.get_or_create(
                client=client,
                name=file_data['name'],
                defaults={
                    'user': user,
                    'description': file_data['description']
                }
            )
            if created:
                file_obj.file.save(
                    file_data['name'],
                    ContentFile(file_data['content']),
                    save=True
                )

        self.stdout.write(self.style.SUCCESS('Successfully created dummy data')) 