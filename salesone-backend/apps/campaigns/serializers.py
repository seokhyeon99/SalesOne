from rest_framework import serializers
from .models import CampaignTemplate, Campaign, CampaignLeadResult
from apps.leads.serializers import LeadSerializer, LeadListSerializer


class CampaignTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignTemplate
        fields = ['id', 'name', 'title', 'body', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class CampaignSerializer(serializers.ModelSerializer):
    lead_lists = LeadListSerializer(many=True, read_only=True)
    lead_list_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    template = CampaignTemplateSerializer(read_only=True)
    template_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'name', 'lead_lists', 'lead_list_ids', 'template', 'template_id',
            'status', 'scheduled_at', 'started_at', 'completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'started_at', 'completed_at']

    def create(self, validated_data):
        lead_list_ids = validated_data.pop('lead_list_ids', [])
        template_id = validated_data.pop('template_id')
        
        campaign = Campaign.objects.create(
            template_id=template_id,
            **validated_data
        )
        
        # Add lead lists to the campaign
        if lead_list_ids:
            campaign.lead_lists.set(lead_list_ids)
            
        return campaign
        
    def update(self, instance, validated_data):
        lead_list_ids = validated_data.pop('lead_list_ids', None)
        template_id = validated_data.pop('template_id', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if template_id:
            instance.template_id = template_id
            
        if lead_list_ids is not None:
            instance.lead_lists.set(lead_list_ids)
            
        instance.save()
        return instance


class CampaignLeadResultSerializer(serializers.ModelSerializer):
    lead = LeadSerializer(read_only=True)
    
    class Meta:
        model = CampaignLeadResult
        fields = [
            'id', 'campaign', 'lead', 'title', 'data', 'status',
            'sent', 'error_message', 'sent_at', 'opened_at', 'clicked_at',
            'replied_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'sent_at', 'opened_at', 
            'clicked_at', 'replied_at'
        ]


class CampaignDetailSerializer(serializers.ModelSerializer):
    lead_lists = LeadListSerializer(many=True, read_only=True)
    template = CampaignTemplateSerializer(read_only=True)
    results = CampaignLeadResultSerializer(many=True, read_only=True)
    results_count = serializers.SerializerMethodField()
    sent_count = serializers.SerializerMethodField()
    opened_count = serializers.SerializerMethodField()
    clicked_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'name', 'lead_lists', 'template', 'status',
            'scheduled_at', 'started_at', 'completed_at',
            'results', 'results_count', 'sent_count', 'opened_count', 'clicked_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'started_at', 'completed_at'
        ]
        
    def get_results_count(self, obj):
        return obj.results.count()
        
    def get_sent_count(self, obj):
        return obj.results.filter(sent=True).count()
        
    def get_opened_count(self, obj):
        return obj.results.filter(status='opened').count()
        
    def get_clicked_count(self, obj):
        return obj.results.filter(status='clicked').count()
