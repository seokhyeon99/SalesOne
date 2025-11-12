from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowViewSet, WorkflowExecutionViewSet, WorkflowScheduleViewSet

# Create a router and register our viewsets
router = DefaultRouter(trailing_slash=False)
router.register(r'workflows', WorkflowViewSet, basename='workflow')
router.register(r'executions', WorkflowExecutionViewSet, basename='workflow-execution')
router.register(r'schedules', WorkflowScheduleViewSet, basename='workflow-schedule')

# The API URLs are determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]
