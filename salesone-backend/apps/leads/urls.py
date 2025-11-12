from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import LeadViewSet, LeadListViewSet, IndustryViewSet

router = DefaultRouter(trailing_slash=False)
router.register('leads', LeadViewSet, basename='leads')
router.register('lists', LeadListViewSet, basename='lead-lists')
router.register('industries', IndustryViewSet, basename='industries')

# The router automatically registers these URLs:
# /leads/ - GET (list), POST (create)
# /leads/{id}/ - GET (retrieve), PUT/PATCH (update), DELETE (delete)
# /leads/search_salesone/ - GET (search SalesOne leads)
# /leads/import_from_salesone/ - POST (import leads from SalesOne)
# /lists/ - GET (list), POST (create)
# /lists/{id}/ - GET (retrieve w/ leads), PUT/PATCH (update), DELETE (delete)
# /lists/{id}/add_leads/ - POST (add leads to list)
# /lists/{id}/remove_leads/ - POST (remove leads from list)
# /industries/ - GET (list of industries)
# /industries/{id}/ - GET (retrieve industry details)

urlpatterns = [
    path('', include(router.urls)),
]
