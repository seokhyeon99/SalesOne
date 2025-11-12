from rest_framework import viewsets, permissions


class BaseViewSet(viewsets.ModelViewSet):
    """
    Base viewset for all viewsets to inherit from.
    Provides basic permission handling.
    """
    permission_classes = [permissions.IsAuthenticated]
