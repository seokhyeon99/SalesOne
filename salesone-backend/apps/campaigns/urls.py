from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
# Add views here when implemented

urlpatterns = [
    path('', include(router.urls)),
]
