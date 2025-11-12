from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField

User = get_user_model()


class Client(models.Model):
    """
    Model for storing client information.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=255)
    representative_name = models.CharField(max_length=255)
    emails = ArrayField(models.EmailField(), default=list, blank=True)
    phones = ArrayField(models.CharField(max_length=20), default=list, blank=True)
    address = models.TextField(null=True, blank=True, default='')
    website = models.URLField(null=True, blank=True, default='')
    business_number = models.CharField(max_length=20, null=True, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class ClientNote(models.Model):
    """
    Model for storing notes related to clients.
    """
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='notes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.name} - {self.title}"

    class Meta:
        ordering = ['-created_at']


def client_file_upload_path(instance, filename):
    return f'clients/{instance.client.id}/files/{filename}'


class ClientFile(models.Model):
    """
    Model for storing files related to clients.
    """
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='files')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True, default='')
    file = models.FileField(upload_to=client_file_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.name} - {self.name}"

    class Meta:
        ordering = ['-created_at']
