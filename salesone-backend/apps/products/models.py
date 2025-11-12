from django.db import models
from django.contrib.auth import get_user_model
from apps.common.models import BaseModel

User = get_user_model()


class Product(BaseModel):
    """
    Model for storing product information.
    
    Fields:
    - name: Product name (e.g., "네이버 검색 CPC 광고")
    - plan_type: Subscription type (one-time, weekly, monthly)
    - price: Product price amount
    - currency: Currency for the price (default: KRW)
    - description: Detailed product description
    - is_active: Whether the product is currently active
    - created_by: User who created the product
    """
    PLAN_TYPE_CHOICES = [
        ('one_time', '일반결제'),
        ('weekly', '매주결제'),
        ('monthly', '매월결제'),
    ]
    
    CURRENCY_CHOICES = [
        ('krw', 'KRW'),
        ('usd', 'USD'),
        ('eur', 'EUR'),
        ('jpy', 'JPY'),
    ]
    
    name = models.CharField(max_length=255, verbose_name="상품명")
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES, verbose_name="결제 유형")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="가격")
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='krw', verbose_name="통화")
    description = models.TextField(verbose_name="상품 설명")
    is_active = models.BooleanField(default=True, verbose_name="활성화 여부")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', verbose_name="생성자")
    
    class Meta:
        verbose_name = "상품"
        verbose_name_plural = "상품"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_plan_type_display()}, {self.price} {self.currency.upper()})"
