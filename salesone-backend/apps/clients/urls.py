from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, ClientNoteViewSet, ClientFileViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'client-notes', ClientNoteViewSet, basename='client-note')
router.register(r'client-files', ClientFileViewSet, basename='client-file')

urlpatterns = [
    path('', include(router.urls)),
]
