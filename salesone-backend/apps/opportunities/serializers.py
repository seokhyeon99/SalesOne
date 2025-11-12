from rest_framework import serializers
from .models import Opportunity
from apps.leads.serializers import LeadSerializer


class OpportunitySerializer(serializers.ModelSerializer):
    lead = LeadSerializer(read_only=True)
    lead_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'name', 'source', 'status', 'value', 'currency',
            'expected_close_date', 'notes', 'lead', 'lead_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
        
    def create(self, validated_data):
        lead_id = validated_data.pop('lead_id', None)
        opportunity = Opportunity.objects.create(**validated_data)
        
        if lead_id:
            opportunity.lead_id = lead_id
            opportunity.save()
            
        return opportunity
        
    def update(self, instance, validated_data):
        lead_id = validated_data.pop('lead_id', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if lead_id:
            instance.lead_id = lead_id
            
        instance.save()
        return instance
