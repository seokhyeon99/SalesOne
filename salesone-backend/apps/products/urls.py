from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProductViewSet

router = DefaultRouter(trailing_slash=False)
router.register('', ProductViewSet, basename='products')

# The DefaultRouter automatically registers these URLs:
# products/ - GET (list), POST (create)
# products/{id}/ - GET (retrieve), PUT/PATCH (update), DELETE (delete)
# products/{id}/toggle_active/ - PATCH (toggle active status)
# products/active/ - GET (list active products)

urlpatterns = [
    path('', include(router.urls)),
]
