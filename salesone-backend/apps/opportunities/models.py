from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from apps.common.models import BaseModel
from apps.leads.models import Lead

User = get_user_model()


class Opportunity(BaseModel):
    """
    Model for tracking potential sales opportunities in different stages.
    """
    STATUS_CHOICES = [
        ('new', _('New')),
        ('qualified', _('Qualified')),
        ('proposal', _('Proposal')),
        ('negotiation', _('Negotiation')),
        ('won', _('Won')),
        ('lost', _('Lost')),
    ]
    
    SOURCE_CHOICES = [
        ('website', _('Website')),
        ('campaign', _('Email Campaign')),
        ('referral', _('Referral')),
        ('social_media', _('Social Media')),
        ('event', _('Event')),
        ('cold_call', _('Cold Call')),
        ('other', _('Other')),
    ]
    
    name = models.CharField(max_length=255, verbose_name=_('Opportunity Name'))
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_('Opportunity Value'))
    currency = models.CharField(max_length=3, default='krw', verbose_name=_('Currency'))
    expected_close_date = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='opportunities')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='opportunities')
    
    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name = _('Opportunity')
        verbose_name_plural = _('Opportunities')
        ordering = ['-created_at']
