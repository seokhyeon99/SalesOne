from rest_framework import serializers
from .models import Industry, Keyword, SalesOneLead, Lead, LeadList, LeadImportTask


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ['id', 'code', 'name']


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ['id', 'name']


class SalesOneLeadSerializer(serializers.ModelSerializer):
    industry = IndustrySerializer(read_only=True)
    keywords = KeywordSerializer(many=True, read_only=True)
    
    class Meta:
        model = SalesOneLead
        fields = [
            'id', 'corporation_number', 'business_number', 'industry', 'industry_name',
            'name', 'name_eng', 'owner', 'email', 'phone', 'homepage', 'handle_goods',
            'employee', 'finance_revenue', 'address', 'si_nm', 'sgg_nm', 'established_date',
            'keywords'
        ]


class LeadSerializer(serializers.ModelSerializer):
    industry = IndustrySerializer(read_only=True)
    industry_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'corporation_number', 'business_number', 'name', 'owner',
            'email', 'phone', 'homepage', 'employee', 'revenue', 'address',
            'si_nm', 'sgg_nm', 'established_date', 'industry', 'industry_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        industry_id = validated_data.pop('industry_id', None)
        lead = Lead.objects.create(**validated_data)
        
        if industry_id:
            lead.industry_id = industry_id
            lead.save()
            
        return lead


class LeadListSerializer(serializers.ModelSerializer):
    leads_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LeadList
        fields = ['id', 'name', 'description', 'leads_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
        
    def get_leads_count(self, obj):
        return obj.leads.count()


class LeadListDetailSerializer(serializers.ModelSerializer):
    leads = LeadSerializer(many=True, read_only=True)
    
    class Meta:
        model = LeadList
        fields = ['id', 'name', 'description', 'leads', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class FileUploadSerializer(serializers.Serializer):
    """Serializer for handling file uploads for lead imports."""
    file = serializers.FileField(
        required=True,
        error_messages={"required": "No file was provided."}
    )
    lead_list_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        help_text="Optional ID of a lead list to add imported leads to."
    )
    column_mapping = serializers.JSONField(
        required=False,
        help_text="Optional mapping of file columns to database fields."
    )
    
    def validate_file(self, value):
        # Check file size (max 100MB)
        if value.size > 100 * 1024 * 1024:
            raise serializers.ValidationError("File size exceeds 10MB.")
        
        # Check file extension
        file_name = value.name.lower()
        if not (file_name.endswith('.csv') or file_name.endswith('.xlsx') or file_name.endswith('.xls')):
            raise serializers.ValidationError("Only CSV and Excel files are supported.")
        
        return value
    
    def validate_lead_list_id(self, value):
        if value:
            # Verify the lead list exists and belongs to the user
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                try:
                    LeadList.objects.get(id=value, user=request.user)
                except LeadList.DoesNotExist:
                    raise serializers.ValidationError("Lead list not found.")
        return value


class LeadImportTaskSerializer(serializers.ModelSerializer):
    """Serializer for the LeadImportTask model."""
    progress = serializers.SerializerMethodField()
    lead_list_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LeadImportTask
        fields = [
            'id', 'task_id', 'file_name', 'file_type', 'status',
            'total_records', 'imported_records', 'error_records',
            'lead_list', 'lead_list_name', 'progress', 'errors',
            'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'task_id', 'file_name', 'file_type', 'status',
            'total_records', 'imported_records', 'error_records',
            'progress', 'errors', 'created_at', 'completed_at'
        ]
    
    def get_progress(self, obj):
        """Calculate the import progress as a percentage."""
        if obj.total_records > 0:
            return round((obj.imported_records / obj.total_records) * 100)
        return 0
    
    def get_lead_list_name(self, obj):
        """Get the name of the associated lead list, if any."""
        if obj.lead_list:
            return obj.lead_list.name
        return None
