import uuid
from django.db import models


class BaseModel(models.Model):
    """
    Base model for all models to inherit from.
    Provides created_at and updated_at timestamps and a UUID primary key.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']
