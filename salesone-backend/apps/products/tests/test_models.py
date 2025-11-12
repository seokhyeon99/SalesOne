from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from apps.products.models import Product
from decimal import Decimal

User = get_user_model()

class ProductModelTests(TestCase):
    """Test cases for the Product model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        self.product = Product.objects.create(
            name='테스트 상품',
            plan_type='monthly',
            price=Decimal('10000.00'),
            currency='krw',
            description='테스트 상품 설명',
            created_by=self.user
        )
    
    def test_product_creation(self):
        """Test that a product can be created."""
        self.assertEqual(self.product.name, '테스트 상품')
        self.assertEqual(self.product.plan_type, 'monthly')
        self.assertEqual(self.product.price, Decimal('10000.00'))
        self.assertEqual(self.product.currency, 'krw')
        self.assertEqual(self.product.description, '테스트 상품 설명')
        self.assertEqual(self.product.created_by, self.user)
        self.assertTrue(self.product.is_active)
    
    def test_product_string_representation(self):
        """Test the string representation of a product."""
        expected_string = f"테스트 상품 (매월결제, 10000.00 KRW)"
        self.assertEqual(str(self.product), expected_string)
    
    def test_product_is_active_default(self):
        """Test that a product is active by default."""
        self.assertTrue(self.product.is_active)
    
    def test_plan_type_choices(self):
        """Test that plan_type must be one of the defined choices."""
        # Create a product with an invalid plan_type
        product = Product(
            name='잘못된 유형 상품',
            plan_type='invalid_type',
            price=Decimal('5000.00'),
            currency='krw',
            description='잘못된 유형의 상품',
            created_by=self.user
        )
        
        # Expect a validation error when full_clean is called
        with self.assertRaises(ValidationError):
            product.full_clean()
    
    def test_currency_choices(self):
        """Test that currency must be one of the defined choices."""
        # Create a product with an invalid currency
        product = Product(
            name='잘못된 통화 상품',
            plan_type='one_time',
            price=Decimal('5000.00'),
            currency='invalid_currency',
            description='잘못된 통화의 상품',
            created_by=self.user
        )
        
        # Expect a validation error when full_clean is called
        with self.assertRaises(ValidationError):
            product.full_clean() 