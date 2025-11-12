from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from decimal import Decimal
from rest_framework.test import APIRequestFactory

User = get_user_model()

class ProductSerializerTests(TestCase):
    """Test cases for the ProductSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        self.product_data = {
            'name': '테스트 상품',
            'plan_type': 'monthly',
            'price': Decimal('10000.00'),
            'currency': 'krw',
            'description': '테스트 상품 설명',
            'is_active': True
        }
        
        self.product = Product.objects.create(
            **self.product_data,
            created_by=self.user
        )
        
        # Create a request factory for context
        self.factory = APIRequestFactory()
    
    def test_serializer_contains_expected_fields(self):
        """Test that the serializer contains the expected fields."""
        request = self.factory.get('/')
        request.user = self.user
        
        serializer = ProductSerializer(instance=self.product, context={'request': request})
        data = serializer.data
        
        expected_fields = {
            'id', 'name', 'plan_type', 'plan_type_display', 
            'price', 'currency', 'currency_display', 
            'description', 'is_active', 
            'created_by', 'created_by_username',
            'created_at', 'updated_at'
        }
        
        self.assertEqual(set(data.keys()), expected_fields)
    
    def test_serializer_validate_positive_price(self):
        """Test that the serializer validates price to be positive."""
        request = self.factory.get('/')
        request.user = self.user
        
        # Test with a negative price
        invalid_data = self.product_data.copy()
        invalid_data['price'] = Decimal('-100.00')
        
        serializer = ProductSerializer(data=invalid_data, context={'request': request})
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)
        
        # Test with zero price
        invalid_data['price'] = Decimal('0.00')
        serializer = ProductSerializer(data=invalid_data, context={'request': request})
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)
    
    def test_serializer_creates_product_with_correct_user(self):
        """Test that the serializer creates a product with the correct user."""
        request = self.factory.get('/')
        request.user = self.user
        
        # Create a new user
        new_user = User.objects.create_user(
            email='new@example.com',
            password='newpassword',
            first_name='New',
            last_name='User'
        )
        
        # Try to create a product with a different user
        data = self.product_data.copy()
        data['name'] = '새 테스트 상품'
        data['created_by'] = new_user.id  # This should be ignored
        
        serializer = ProductSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())
        new_product = serializer.save()
        
        # The created_by should be the user from the request, not the one in the data
        self.assertEqual(new_product.created_by, self.user)
    
    def test_serializer_read_only_fields(self):
        """Test that the read-only fields cannot be updated."""
        request = self.factory.get('/')
        request.user = self.user
        
        # Try to update read-only fields
        data = {
            'id': '00000000-0000-0000-0000-000000000000',
            'created_at': '2020-01-01T00:00:00Z',
            'updated_at': '2020-01-01T00:00:00Z',
            'created_by': User.objects.create_user(
                email='new2@example.com',
                password='newpassword2',
                first_name='New2',
                last_name='User2'
            ).id,
            'name': '업데이트된 상품',
            'price': Decimal('20000.00')
        }
        
        serializer = ProductSerializer(instance=self.product, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid())
        updated_product = serializer.save()
        
        # Read-only fields should not be updated
        self.assertNotEqual(str(updated_product.id), '00000000-0000-0000-0000-000000000000')
        self.assertNotEqual(updated_product.created_by.id, data['created_by'])
        
        # Non-read-only fields should be updated
        self.assertEqual(updated_product.name, '업데이트된 상품')
        self.assertEqual(updated_product.price, Decimal('20000.00')) 