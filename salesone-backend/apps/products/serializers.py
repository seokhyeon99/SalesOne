from rest_framework import serializers
from apps.common.serializers import BaseSerializer
from .models import Product


class ProductSerializer(BaseSerializer):
    """
    Serializer for the Product model.
    
    Added features:
    - Displays human-readable values for plan_type and currency
    - Includes created_by as a read-only field
    - Validates price to be positive
    - Automatically sets created_by from request context
    """
    plan_type_display = serializers.CharField(source='get_plan_type_display', read_only=True)
    currency_display = serializers.CharField(source='get_currency_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'plan_type', 'plan_type_display', 
            'price', 'currency', 'currency_display', 
            'description', 'is_active', 
            'created_by', 'created_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']
    
    def validate_price(self, value):
        """
        Check that the price is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("가격은 반드시 양수여야 합니다.")
        return value
    
    def create(self, validated_data):
        """
        Create a new product instance.
        Set created_by from request context.
        """
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
