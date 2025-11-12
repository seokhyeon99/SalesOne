from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from apps.products.models import Product
from decimal import Decimal
import json

User = get_user_model()

class ProductViewSetTests(APITestCase):
    """Test cases for the ProductViewSet."""
    
    def setUp(self):
        """Set up test data."""
        # Create regular user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='adminpassword',
            first_name='Admin',
            last_name='User',
            is_staff=True
        )
        
        # Create products
        self.product1 = Product.objects.create(
            name='테스트 상품 1',
            plan_type='monthly',
            price=Decimal('10000.00'),
            currency='krw',
            description='테스트 상품 설명 1',
            created_by=self.admin_user
        )
        
        self.product2 = Product.objects.create(
            name='테스트 상품 2',
            plan_type='one_time',
            price=Decimal('20000.00'),
            currency='krw',
            description='테스트 상품 설명 2',
            is_active=False,
            created_by=self.admin_user
        )
        
        # Setup API client
        self.client = APIClient()
        
        # URLs
        self.list_url = reverse('products-list')
        self.detail_url = reverse('products-detail', kwargs={'pk': self.product1.id})
        self.toggle_active_url = reverse('products-toggle-active', kwargs={'pk': self.product1.id})
        self.active_url = reverse('products-active')
    
    def test_list_products_as_regular_user(self):
        """Test that a regular user can list products."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pagination is being used
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 2)  # Both active and inactive products
        else:
            self.assertEqual(len(response.data), 2)  # If not paginated
    
    def test_retrieve_product_as_regular_user(self):
        """Test that a regular user can retrieve a product."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], '테스트 상품 1')
    
    def test_create_product_as_regular_user_forbidden(self):
        """Test that a regular user cannot create a product."""
        self.client.force_authenticate(user=self.user)
        data = {
            'name': '새 상품',
            'plan_type': 'weekly',
            'price': '15000.00',
            'currency': 'krw',
            'description': '새 상품 설명'
        }
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_product_as_regular_user_forbidden(self):
        """Test that a regular user cannot update a product."""
        self.client.force_authenticate(user=self.user)
        data = {'name': '수정된 상품 이름'}
        response = self.client.patch(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_product_as_regular_user_forbidden(self):
        """Test that a regular user cannot delete a product."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_product_as_admin(self):
        """Test that an admin can create a product."""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': '새 상품',
            'plan_type': 'weekly',
            'price': '15000.00',
            'currency': 'krw',
            'description': '새 상품 설명'
        }
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], '새 상품')
        # UUID values need to be converted to string for comparison
        self.assertEqual(str(response.data['created_by']), str(self.admin_user.id))
    
    def test_update_product_as_admin(self):
        """Test that an admin can update a product."""
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': '수정된 상품 이름'}
        response = self.client.patch(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], '수정된 상품 이름')
    
    def test_delete_product_as_admin(self):
        """Test that an admin can delete a product."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product1.id).exists())
    
    def test_toggle_active_as_admin(self):
        """Test the toggle_active action."""
        self.client.force_authenticate(user=self.admin_user)
        
        # Product is initially active
        self.assertTrue(self.product1.is_active)
        
        # Toggle to inactive
        response = self.client.patch(self.toggle_active_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from DB and check if it's now inactive
        self.product1.refresh_from_db()
        self.assertFalse(self.product1.is_active)
        
        # Toggle back to active
        response = self.client.patch(self.toggle_active_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from DB and check if it's now active again
        self.product1.refresh_from_db()
        self.assertTrue(self.product1.is_active)
    
    def test_active_products_endpoint(self):
        """Test the active products endpoint."""
        self.client.force_authenticate(user=self.admin_user)  # Use admin user since route might be protected
        response = self.client.get(self.active_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pagination is being used
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)  # Only active products
            self.assertEqual(response.data['results'][0]['name'], '테스트 상품 1')
        else:
            self.assertEqual(len(response.data), 1)  # If not paginated
            self.assertEqual(response.data[0]['name'], '테스트 상품 1')
    
    def test_filter_by_plan_type(self):
        """Test filtering products by plan_type."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"{self.list_url}?plan_type=monthly")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pagination is being used
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['name'], '테스트 상품 1')
        else:
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['name'], '테스트 상품 1')
    
    def test_filter_by_price_range(self):
        """Test filtering products by price range."""
        self.client.force_authenticate(user=self.user)
        
        # Price range that includes both products
        response = self.client.get(f"{self.list_url}?min_price=5000&max_price=25000")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pagination is being used
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 2)
        else:
            self.assertEqual(len(response.data), 2)
        
        # Price range that includes only one product
        response = self.client.get(f"{self.list_url}?min_price=15000")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pagination is being used
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['name'], '테스트 상품 2')
        else:
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['name'], '테스트 상품 2')
    
    def test_search_products(self):
        """Test searching products by name or description."""
        self.client.force_authenticate(user=self.user)
        
        # Search by name
        response = self.client.get(f"{self.list_url}?search=상품 1")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pagination is being used
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['name'], '테스트 상품 1')
        else:
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['name'], '테스트 상품 1')
        
        # Search by description
        response = self.client.get(f"{self.list_url}?search=설명 2")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pagination is being used
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['name'], '테스트 상품 2')
        else:
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['name'], '테스트 상품 2')
    
    def test_ordering_products(self):
        """Test ordering products by various fields."""
        self.client.force_authenticate(user=self.user)
        
        # Order by name ascending (default)
        response = self.client.get(f"{self.list_url}?ordering=name")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if pagination is being used
        data_items = response.data['results'] if 'results' in response.data else response.data
        
        # Our tests assume sorting by name gives product1 then product2
        self.assertEqual(data_items[0]['name'], '테스트 상품 1')
        self.assertEqual(data_items[1]['name'], '테스트 상품 2')
        
        # Order by name descending
        response = self.client.get(f"{self.list_url}?ordering=-name")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if pagination is being used
        data_items = response.data['results'] if 'results' in response.data else response.data
        
        # Our tests assume sorting by -name gives product2 then product1
        self.assertEqual(data_items[0]['name'], '테스트 상품 2')
        self.assertEqual(data_items[1]['name'], '테스트 상품 1')
        
        # Order by price ascending
        response = self.client.get(f"{self.list_url}?ordering=price")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if pagination is being used
        data_items = response.data['results'] if 'results' in response.data else response.data
        
        # Our tests assume sorting by price gives product1 then product2
        self.assertEqual(data_items[0]['price'], '10000.00')
        self.assertEqual(data_items[1]['price'], '20000.00')
        
        # Order by price descending
        response = self.client.get(f"{self.list_url}?ordering=-price")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if pagination is being used
        data_items = response.data['results'] if 'results' in response.data else response.data
        
        # Our tests assume sorting by -price gives product2 then product1
        self.assertEqual(data_items[0]['price'], '20000.00')
        self.assertEqual(data_items[1]['price'], '10000.00') 