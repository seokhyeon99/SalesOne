from rest_framework import permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, NumberFilter, BooleanFilter
from apps.common.views import BaseViewSet
from .models import Product
from .serializers import ProductSerializer


class ProductFilter(FilterSet):
    """
    Filter for Product model.
    Supports filtering by name, price range, plan type, and active status.
    """
    name = CharFilter(field_name='name', lookup_expr='icontains')
    min_price = NumberFilter(field_name='price', lookup_expr='gte')
    max_price = NumberFilter(field_name='price', lookup_expr='lte')
    plan_type = CharFilter(field_name='plan_type')
    is_active = BooleanFilter(field_name='is_active')
    
    class Meta:
        model = Product
        fields = ['name', 'min_price', 'max_price', 'plan_type', 'is_active', 'currency']


class ProductViewSet(BaseViewSet):
    """
    ViewSet for managing products.
    
    Provides standard CRUD operations plus:
    - Filtering by name, price range, plan type, and active status
    - Search by name and description
    - Ordering by name, price, and creation date
    - All operations are accessible to any authenticated user
    - Toggle active status endpoint
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        
        All actions are accessible to any authenticated user.
        """
        permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request, *args, **kwargs):
        """
        Override list method to ensure consistent response format
        with results and count fields for frontend compatibility.
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        # Wrap the response in a results field for frontend consistency
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """
        Toggle the is_active status of a product.
        """
        product = self.get_object()
        product.is_active = not product.is_active
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get only active products.
        """
        active_products = Product.objects.filter(is_active=True)
        page = self.paginate_queryset(active_products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(active_products, many=True)
        # Wrap the response in a results field for frontend consistency
        return Response({
            'results': serializer.data,
            'count': active_products.count()
        })
