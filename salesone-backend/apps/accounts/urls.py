from django.urls import path
from .views import update_user_profile

app_name = 'accounts'

urlpatterns = [
    # Keep only custom endpoints that extend beyond dj-rest-auth's functionality
    path('me/update/', update_user_profile, name='update-profile'),
]
