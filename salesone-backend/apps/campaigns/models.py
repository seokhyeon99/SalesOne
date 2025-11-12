from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from apps.common.models import BaseModel
from apps.leads.models import Lead, LeadList

User = get_user_model()


class CampaignTemplate(BaseModel):
    """
    Model for storing reusable email campaign templates.
    """
    name = models.CharField(max_length=255, verbose_name=_('Template Name'))
    title = models.CharField(max_length=255, verbose_name=_('Email Subject'))
    body = models.TextField(verbose_name=_('Email Body HTML'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaign_templates')
    
    def __str__(self):
        return self.name


class Campaign(BaseModel):
    """
    Model for managing email marketing campaigns.
    """
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('scheduled', _('Scheduled')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
    ]
    
    name = models.CharField(max_length=255, verbose_name=_('Campaign Name'))
    lead_lists = models.ManyToManyField(LeadList, related_name='campaigns')
    template = models.ForeignKey(CampaignTemplate, on_delete=models.CASCADE, related_name='campaigns')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.name


class CampaignLeadResult(BaseModel):
    """
    Model for tracking the results of campaigns for each lead.
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('sent', _('Sent')),
        ('opened', _('Opened')),
        ('clicked', _('Clicked')),
        ('replied', _('Replied')),
        ('bounced', _('Bounced')),
        ('failed', _('Failed')),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='results')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='campaign_results')
    title = models.CharField(max_length=255, verbose_name=_('Personalized Title'))
    data = models.JSONField(null=True, blank=True, verbose_name=_('Personalization Data'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent = models.BooleanField(default=False)
    error_message = models.TextField(null=True, blank=True)
    
    # Tracking timestamps
    sent_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    replied_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('campaign', 'lead')
    
    def __str__(self):
        return f"{self.campaign.name} - {self.lead.name}"
