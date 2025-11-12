from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from apps.leads.models import SalesOneLead, Industry
from datetime import datetime

User = get_user_model()

class SalesOneLeadSearchTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Create test industry
        self.industry = Industry.objects.create(
            code='S96113',
            name='피부 미용업'
        )
        
        # Create test leads in SalesOne database
        self.lead1 = SalesOneLead.objects.create(
            corporation_number='1101112955908',
            business_number='2068188409',
            name='주식회사 넥스파시스템',
            owner='서종렬',
            email='test1@nexpa.co.kr',
            phone='02-2243-4011',
            homepage=['repurehc.com'],
            employee=11,
            finance_revenue=10589738000,
            address='서울특별시 금천구 가산디지털1로 25',
            si_nm='서울특별시',
            sgg_nm='금천구',
            established_date=datetime(2003, 10, 17).date(),
            industry=self.industry,
            is_corporation=True
        )
        
        self.lead2 = SalesOneLead.objects.create(
            corporation_number='1101111713381',
            business_number='1188120723',
            name='(주)대우캐리어판매',
            owner='이경남',
            email='test2@carrier.co.kr',
            phone='02-849-7976',
            homepage=['carrier.co.kr'],
            employee=16,
            finance_revenue=21857000000,
            address='서울특별시 영등포구 도신로 148',
            si_nm='서울특별시',
            sgg_nm='영등포구',
            established_date=datetime(1999, 6, 12).date(),
            industry=self.industry,
            is_corporation=True
        )
        
        self.search_url = reverse('leads-search-salesone')

    def test_basic_search(self):
        """Test basic search functionality"""
        response = self.client.get(self.search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_search_by_query(self):
        """Test search with text query"""
        response = self.client.get(f'{self.search_url}?query=넥스파')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], '주식회사 넥스파시스템')

    def test_filter_by_industry(self):
        """Test filtering by industry code"""
        response = self.client.get(f'{self.search_url}?industry={self.industry.code}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_filter_by_location(self):
        """Test filtering by location"""
        response = self.client.get(f'{self.search_url}?si_nm=서울특별시&sgg_nm=금천구')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], '주식회사 넥스파시스템')

    def test_filter_by_revenue(self):
        """Test filtering by revenue range"""
        response = self.client.get(
            f'{self.search_url}?min_revenue=15000000000&max_revenue=25000000000'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], '(주)대우캐리어판매')

    def test_filter_by_employee_count(self):
        """Test filtering by employee count"""
        response = self.client.get(
            f'{self.search_url}?min_employee=15&max_employee=20'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], '(주)대우캐리어판매')

    def test_filter_by_established_date(self):
        """Test filtering by establishment date"""
        response = self.client.get(
            f'{self.search_url}?min_established=2000-01-01&max_established=2005-12-31'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], '주식회사 넥스파시스템')

    def test_filter_by_corporation_status(self):
        """Test filtering by corporation status"""
        response = self.client.get(f'{self.search_url}?is_corporation=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_sorting(self):
        """Test sorting functionality"""
        # Test sorting by revenue (descending)
        response = self.client.get(f'{self.search_url}?sort=-finance_revenue')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['name'], '(주)대우캐리어판매')
        
        # Test sorting by employee count (ascending)
        response = self.client.get(f'{self.search_url}?sort=employee')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['name'], '주식회사 넥스파시스템')

    def test_combined_filters(self):
        """Test combining multiple filters"""
        response = self.client.get(
            f'{self.search_url}?si_nm=서울특별시&min_employee=10&is_corporation=true'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2) 