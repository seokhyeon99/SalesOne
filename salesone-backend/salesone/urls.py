"""
URL configuration for salesone project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.urls import re_path
from django.conf import settings
from django.conf.urls.static import static
from dj_rest_auth.views import PasswordResetConfirmView
from django.views.generic import TemplateView

urlpatterns = [
    re_path(r'^admin/?', admin.site.urls),
    
    # Authentication URLs
    re_path(r'^api/auth/?', include('dj_rest_auth.urls')),
    re_path(r'^api/auth/registration', include('dj_rest_auth.registration.urls')),
    re_path(r'^api/auth/password/reset/confirm/<uidb64>/<token>/?', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    re_path(r'^api/auth/account-confirm-email/<str:key>/?', TemplateView.as_view(), name='account_confirm_email'),
    
    # Accounts URLs
    re_path(r'^api/accounts/?', include('apps.accounts.urls')),
    
    # API URLs
    re_path(r'^api/products/?', include('apps.products.urls')),
    re_path(r'^api/leads/?', include('apps.leads.urls')),
    re_path(r'^api/campaigns/?', include('apps.campaigns.urls')),
    re_path(r'^api/opportunities/?', include('apps.opportunities.urls')),
    re_path(r'^api/clients/?', include('apps.clients.urls')),
    re_path(r'^api/tasks/?', include('apps.tasks.urls')),
    re_path(r'^api/workflows/?', include('apps.workflows.urls')),
]

# Add media files URLs in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [re_path(r'^__debug__/?', include('debug_toolbar.urls'))]
