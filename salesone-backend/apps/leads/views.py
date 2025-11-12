from rest_framework import permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, NumberFilter, DateFilter
from django.db.models import Q, F
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from datetime import datetime
from apps.common.views import BaseViewSet
from .models import Lead, LeadList, SalesOneLead, Industry, LeadImportTask
from .serializers import (
    LeadSerializer, 
    LeadListSerializer, 
    LeadListDetailSerializer,
    SalesOneLeadSerializer,
    IndustrySerializer,
    FileUploadSerializer,
    LeadImportTaskSerializer
)
from .tasks import process_lead_file_import
from django.shortcuts import get_object_or_404


class LeadFilter(FilterSet):
    """
    Filter for Lead model.
    Supports filtering by name, corporation number, business number, revenue range, etc.
    """
    name = CharFilter(field_name='name', lookup_expr='icontains')
    corporation_number = CharFilter(field_name='corporation_number')
    business_number = CharFilter(field_name='business_number')
    owner = CharFilter(field_name='owner', lookup_expr='icontains')
    si_nm = CharFilter(field_name='si_nm', lookup_expr='icontains')
    sgg_nm = CharFilter(field_name='sgg_nm', lookup_expr='icontains')
    min_revenue = NumberFilter(field_name='revenue', lookup_expr='gte')
    max_revenue = NumberFilter(field_name='revenue', lookup_expr='lte')
    min_employee = NumberFilter(field_name='employee', lookup_expr='gte')
    max_employee = NumberFilter(field_name='employee', lookup_expr='lte')
    established_after = DateFilter(field_name='established_date', lookup_expr='gte')
    established_before = DateFilter(field_name='established_date', lookup_expr='lte')
    industry = CharFilter(field_name='industry__code')
    
    class Meta:
        model = Lead
        fields = [
            'name', 'corporation_number', 'business_number', 'owner',
            'si_nm', 'sgg_nm', 'min_revenue', 'max_revenue',
            'min_employee', 'max_employee', 'established_after',
            'established_before', 'industry'
        ]


class LeadPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 500


class LeadViewSet(BaseViewSet):
    """
    ViewSet for managing leads.
    
    Provides standard CRUD operations plus:
    - Filtering by various lead attributes
    - Search across multiple fields using PostgreSQL Full-Text Search
    - Ordering by various fields
    - All operations are restricted to the user's own leads
    """
    serializer_class = LeadSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = LeadFilter
    search_fields = ['name', 'owner', 'address', 'si_nm', 'sgg_nm']
    ordering_fields = ['name', 'created_at', 'revenue', 'employee', 'established_date']
    ordering = ['name']
    pagination_class = None  # Disable pagination by default
    
    def get_queryset(self):
        """
        Return leads belonging to the current user.
        """
        return Lead.objects.filter(user=self.request.user).select_related('industry')
    
    def perform_create(self, serializer):
        """
        Set the user when creating a lead.
        """
        serializer.save(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """
        List leads with optional full-text search.
        Returns results in a consistent format with count.
        """
        queryset = self.get_queryset()
        
        # Handle full-text search if search parameter is provided
        search_query = request.query_params.get('search', '').strip()
        if search_query:
            psql_query = SearchQuery(search_query, config='simple')
            queryset = queryset.filter(search_vector__isnull=False).annotate(
                rank=SearchRank('search_vector', psql_query)
            ).filter(search_vector=psql_query).order_by('-rank')
        else:
            queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=False, methods=['get'])
    def search_salesone(self, request):
        """
        Search SalesOne leads with advanced filtering.
        """
        pagination = LeadPagination()
        queryset = SalesOneLead.objects.all()
        
        # Apply filters from query parameters
        filters = {
            'industry': ('industry__code', str),
            'employee_min': ('employee__gte', int),
            'employee_max': ('employee__lte', int),
            'established_after': ('established_date__gte', str),
            'established_before': ('established_date__lte', str),
        }
        
        for param, (field, type_cast) in filters.items():
            value = request.query_params.get(param)
            if value:
                try:
                    queryset = queryset.filter(**{field: type_cast(value)})
                except (ValueError, TypeError):
                    pass
        
        # Handle company name search
        company_name = request.query_params.get('company_name')
        if company_name:
            queryset = queryset.filter(name__icontains=company_name)
        
        # Handle region filters
        si_nm = request.query_params.get('si_nm')
        sgg_nm = request.query_params.get('sgg_nm')
        if si_nm:
            queryset = queryset.filter(si_nm=si_nm)
        if sgg_nm:
            queryset = queryset.filter(sgg_nm=sgg_nm)
        
        # Handle required fields filters
        if request.query_params.get('has_email') == 'true':
            queryset = queryset.exclude(email__isnull=True).exclude(email='')
            
        if request.query_params.get('has_homepage') == 'true':
            queryset = queryset.exclude(homepage__isnull=True).filter(homepage__len__gt=0)
            
        if request.query_params.get('has_phone') == 'true':
            queryset = queryset.exclude(phone__isnull=True).exclude(phone='')
            
        # Handle revenue range
        revenue_range = request.query_params.get('revenue_range')
        if revenue_range:
            try:
                min_rev, max_rev = map(int, revenue_range.split(','))
                if min_rev > 0:
                    queryset = queryset.filter(finance_revenue__gte=min_rev)
                if max_rev > 0:
                    queryset = queryset.filter(finance_revenue__lte=max_rev)
            except (ValueError, AttributeError):
                pass
        
        # Apply pagination
        page = pagination.paginate_queryset(queryset, request)
        if page is not None:
            serializer = SalesOneLeadSerializer(page, many=True)
            return pagination.get_paginated_response(serializer.data)
        
        serializer = SalesOneLeadSerializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=False, methods=['get'])
    def get_regions(self, request):
        """
        Get list of regions (si_nm) and their districts (sgg_nm).
        If si_nm is provided, returns only districts for that region.
        """
        si_nm = request.query_params.get('si_nm')
        
        if si_nm:
            # Get districts for specific region
            districts = SalesOneLead.objects.filter(
                si_nm=si_nm,
                sgg_nm__isnull=False
            ).values_list('sgg_nm', flat=True).distinct().order_by('sgg_nm')
            
            return Response({
                'sgg_nm': list(districts)
            })
        else:
            # Get all regions
            regions = SalesOneLead.objects.filter(
                si_nm__isnull=False
            ).values_list('si_nm', flat=True).distinct().order_by('si_nm')
            
            return Response({
                'si_nm': list(regions)
            })
    
    @action(detail=False, methods=['post'])
    def import_from_salesone(self, request):
        """
        Import leads from the SalesOne lead database to the user's leads.
        If leads already exist, returns their IDs instead of creating new ones.
        """
        lead_ids = request.data.get('lead_ids', [])
        if not lead_ids:
            return Response({
                'error': 'No lead IDs provided',
                'count': 0,
                'results': []
            }, status=status.HTTP_400_BAD_REQUEST)

        imported_leads = []
        existing_leads = []
        errors = []
        
        # Get all SalesOne leads in one query for better performance
        salesone_leads = SalesOneLead.objects.filter(id__in=lead_ids)
        if not salesone_leads.exists():
            return Response({
                'error': 'No valid SalesOne leads found with the provided IDs',
                'count': 0,
                'results': []
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check for existing leads to avoid duplicates
        existing_leads_map = {
            lead.corporation_number: lead 
            for lead in Lead.objects.filter(
                user=request.user,
                corporation_number__in=salesone_leads.values_list('corporation_number', flat=True)
            )
        }
        
        for salesone_lead in salesone_leads:
            try:
                # If lead already exists, add it to existing_leads
                if salesone_lead.corporation_number in existing_leads_map:
                    existing_lead = existing_leads_map[salesone_lead.corporation_number]
                    existing_leads.append(existing_lead)
                    continue
                
                # Create new lead from SalesOne lead
                lead = Lead.objects.create(
                    user=request.user,
                    corporation_number=salesone_lead.corporation_number,
                    business_number=salesone_lead.business_number,
                    name=salesone_lead.name,
                    owner=salesone_lead.owner,
                    email=salesone_lead.email,
                    phone=salesone_lead.phone,
                    homepage=salesone_lead.homepage,
                    employee=salesone_lead.employee,
                    revenue=salesone_lead.finance_revenue,
                    address=salesone_lead.address,
                    si_nm=salesone_lead.si_nm,
                    sgg_nm=salesone_lead.sgg_nm,
                    established_date=salesone_lead.established_date,
                    industry=salesone_lead.industry
                )
                
                imported_leads.append(lead)
                
            except Exception as e:
                errors.append({
                    'id': salesone_lead.id,
                    'error': str(e)
                })
                continue
        
        response_data = {
            'count': len(imported_leads),
            'results': LeadSerializer(imported_leads, many=True).data,
            'existing_leads': LeadSerializer(existing_leads, many=True).data,
            'existing_count': len(existing_leads)
        }
        
        if errors:
            response_data['errors'] = errors
            
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def import_file(self, request):
        """
        Import leads from a CSV or Excel file.
        
        This endpoint accepts a file upload and processes it in the background.
        """
        serializer = FileUploadSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            file_obj = serializer.validated_data['file']
            lead_list_id = serializer.validated_data.get('lead_list_id')
            column_mapping = serializer.validated_data.get('column_mapping')
            
            # Determine file type
            file_name = file_obj.name.lower()
            if file_name.endswith('.csv'):
                file_type = 'csv'
            elif file_name.endswith('.xlsx') or file_name.endswith('.xls'):
                file_type = 'excel'
            else:
                return Response(
                    {'error': 'Unsupported file format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create unique file name
            unique_filename = f"lead_import_{uuid.uuid4()}{os.path.splitext(file_name)[1]}"
            
            # Create the media directory if it doesn't exist
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'lead_imports')
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save the file
            file_path = os.path.join(upload_dir, unique_filename)
            with open(file_path, 'wb+') as destination:
                for chunk in file_obj.chunks():
                    destination.write(chunk)
            
            # Process the file in a background task
            options = {
                'lead_list_id': str(lead_list_id) if lead_list_id else None,
                'column_mapping': column_mapping
            }
            
            task = process_lead_file_import.delay(
                file_path, 
                str(request.user.id), 
                file_type, 
                options
            )
            
            return Response({
                'task_id': task.id,
                'status': 'processing',
                'message': 'File upload successful. The file is being processed.'
            }, status=status.HTTP_202_ACCEPTED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='import-status/(?P<task_id>[^/.]+)')
    def import_status(self, request, task_id=None):
        """
        Check the status of a lead import task.
        """
        if not task_id:
            return Response(
                {'error': 'Task ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Look up the import task in the database
            import_task = LeadImportTask.objects.get(
                task_id=task_id,
                user=request.user
            )
            
            response_data = {
                'task_id': task_id,
                'status': import_task.status,
                'file_name': import_task.file_name,
                'total_records': import_task.total_records,
                'imported_records': import_task.imported_records,
                'error_records': import_task.error_records,
                'errors': import_task.errors,
                'created_at': import_task.created_at,
                'completed_at': import_task.completed_at,
            }
            
            # Add progress information
            if import_task.total_records > 0:
                response_data['progress'] = round(
                    (import_task.imported_records / import_task.total_records) * 100
                )
            else:
                response_data['progress'] = 0
                
            return Response(response_data)
            
        except LeadImportTask.DoesNotExist:
            return Response(
                {
                    'task_id': task_id,
                    'status': 'unknown',
                    'message': 'Import task not found or not associated with your account.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='import-tasks')
    def import_tasks(self, request):
        """
        List all lead import tasks for the current user.
        """
        import_tasks = LeadImportTask.objects.filter(user=request.user)
        serializer = LeadImportTaskSerializer(import_tasks, many=True)
        
        return Response({
            'results': serializer.data,
            'count': import_tasks.count()
        })

    @action(detail=False, methods=['post'])
    def create_and_add_to_list(self, request):
        """
        Create a new lead and add it to a specific lead list.
        """
        lead_list_id = request.data.pop('lead_list_id', None)
        if not lead_list_id:
            return Response(
                {'error': '리드 리스트 ID가 필요합니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lead_list = LeadList.objects.get(id=lead_list_id, user=request.user)
        except LeadList.DoesNotExist:
            return Response(
                {'error': '리드 리스트를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create the lead
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Set the user and save
        lead = serializer.save(user=request.user)

        # Add to lead list
        lead_list.leads.add(lead)

        return Response(
            {
                'message': '리드가 생성되고 리스트에 추가되었습니다.',
                'lead': serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class LeadListViewSet(BaseViewSet):
    """
    ViewSet for managing lead lists.
    
    Provides:
    - CRUD operations for lead lists
    - Adding/removing leads from lists
    - All operations are restricted to the user's own lists
    """
    serializer_class = LeadListSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    pagination_class = LeadPagination
    lookup_field = 'id'
    
    def get_object(self):
        """
        Override get_object to handle UUID lookup properly
        """
        queryset = self.get_queryset()
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        
        try:
            # Try to convert the ID to UUID
            lookup_value = uuid.UUID(self.kwargs[lookup_url_kwarg])
            filter_kwargs = {self.lookup_field: lookup_value}
            obj = get_object_or_404(queryset, **filter_kwargs)
            self.check_object_permissions(self.request, obj)
            return obj
        except (ValueError, TypeError):
            # If UUID conversion fails, try normal lookup
            return super().get_object()
    
    def get_queryset(self):
        """Return lead lists belonging to the current user."""
        return LeadList.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user when creating a lead list."""
        serializer.save(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """List lead lists with lead count."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Get detailed view of a lead list including paginated leads with search support."""
        instance = self.get_object()
        
        # Get search query from request and decode it
        search_query = request.query_params.get('search', '').strip()
        
        # Get leads queryset with search if provided
        leads_queryset = instance.leads.all()
        if search_query:
            # Use Q objects with icontains for case-insensitive search
            leads_queryset = leads_queryset.filter(
                Q(name__icontains=search_query) |
                Q(owner__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(phone__icontains=search_query) |
                Q(address__icontains=search_query) |
                Q(si_nm__icontains=search_query) |
                Q(sgg_nm__icontains=search_query) |
                Q(industry__name__icontains=search_query)
            ).distinct()
        
        # Apply pagination to leads
        paginator = self.pagination_class()
        try:
            paginated_leads = paginator.paginate_queryset(leads_queryset, request)
        except Exception as e:
            return Response(
                {"error": "페이지네이션 처리 중 오류가 발생했습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if paginated_leads is not None:
            try:
                lead_serializer = LeadSerializer(paginated_leads, many=True)
                leads_data = lead_serializer.data
                pagination_data = paginator.get_paginated_response(leads_data).data
                
                # Return combined response
                return Response({
                    'id': instance.id,
                    'name': instance.name,
                    'description': instance.description,
                    'created_at': instance.created_at,
                    'updated_at': instance.updated_at,
                    'leads': pagination_data['results'],
                    'count': pagination_data['count'],
                    'next': pagination_data['next'],
                    'previous': pagination_data['previous']
                })
            except Exception as e:
                return Response(
                    {"error": "데이터 직렬화 중 오류가 발생했습니다."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # If pagination is disabled
        lead_serializer = LeadSerializer(leads_queryset, many=True)
        return Response({
            'id': instance.id,
            'name': instance.name,
            'description': instance.description,
            'created_at': instance.created_at,
            'updated_at': instance.updated_at,
            'leads': lead_serializer.data,
            'count': leads_queryset.count()
        })
    
    @action(detail=True, methods=['post'])
    def add_leads(self, request, id=None):
        """Add leads to a list."""
        lead_list = self.get_object()
        lead_ids = request.data.get('lead_ids', [])
        
        if not lead_ids:
            return Response({"error": "No lead IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        lead_list.leads.add(*lead_ids)
        return Response({"message": "Leads added successfully"})
    
    @action(detail=True, methods=['post'])
    def remove_leads(self, request, id=None):
        """Remove leads from a list."""
        lead_list = self.get_object()
        lead_ids = request.data.get('lead_ids', [])
        
        if not lead_ids:
            return Response({"error": "No lead IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        lead_list.leads.remove(*lead_ids)
        return Response({"message": "Leads removed successfully"})


class IndustryViewSet(BaseViewSet):
    """
    ViewSet for retrieving industry information.
    Read-only access to all industries.
    """
    queryset = Industry.objects.all()
    serializer_class = IndustrySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']
    ordering = ['name']
    
    def list(self, request, *args, **kwargs):
        """List industries with consistent response format."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
