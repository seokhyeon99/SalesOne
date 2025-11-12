import uuid
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.search import SearchVectorField, SearchVector
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.common.models import BaseModel

User = get_user_model()


class Industry(models.Model):
    """
    Model for storing industry information linked to leads.
    """
    code = models.CharField(max_length=20, unique=True, verbose_name=_('Industry Code'))
    name = models.CharField(max_length=200, verbose_name=_('Industry Name'))

    class Meta:
        verbose_name = _('Industry')
        verbose_name_plural = _('Industries')

    def __str__(self):
        return f"{self.name} ({self.code})"


class Keyword(models.Model):
    """
    Model for storing keywords that can be associated with leads.
    """
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class SalesOneLead(models.Model):
    """
    Global lead database not linked to specific workspaces.
    Contains over 5 million records of company/business data.
    """
    corporation_number = models.CharField(max_length=13, unique=True, verbose_name=_('Corporation Number'))
    business_number = models.CharField(max_length=10, null=True, blank=True, verbose_name=_('Business Number'))
    industry = models.ForeignKey(Industry, on_delete=models.SET_NULL, null=True, related_name='salesone_leads')
    industry_name = models.CharField(max_length=200, null=True, blank=True)
    name = models.CharField(max_length=200, verbose_name=_('Company Name'))
    name_eng = models.CharField(max_length=200, null=True, blank=True, verbose_name=_('English Name'))
    owner = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('Owner/CEO'))
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    homepage = models.JSONField(null=True, blank=True, verbose_name=_('Website URLs'))
    handle_goods = models.JSONField(null=True, blank=True, verbose_name=_('Products/Services'))
    employee = models.IntegerField(default=1, verbose_name=_('Number of Employees'))
    
    # Financial information
    finance_currency_code = models.CharField(max_length=5, null=True, blank=True)
    finance_year = models.IntegerField(null=True, blank=True)
    finance_revenue = models.BigIntegerField(null=True, blank=True)
    finance_operating_profit = models.BigIntegerField(null=True, blank=True)
    finance_comprehensive_income = models.BigIntegerField(null=True, blank=True)
    finance_net_profit = models.BigIntegerField(null=True, blank=True)
    finance_total_assets = models.BigIntegerField(null=True, blank=True)
    finance_total_liabilities = models.BigIntegerField(null=True, blank=True)
    finance_total_equity = models.BigIntegerField(null=True, blank=True)
    finance_capital = models.BigIntegerField(null=True, blank=True)
    finance_debt_ratio = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Business information
    is_normal_taxpayer = models.BooleanField(default=False)
    is_corporation = models.BooleanField(default=False)
    address = models.TextField(null=True, blank=True)
    si_nm = models.CharField(max_length=50, null=True, blank=True, verbose_name=_('City/Province'))
    sgg_nm = models.CharField(max_length=50, null=True, blank=True, verbose_name=_('District'))
    postal_code = models.CharField(max_length=6, null=True, blank=True)
    established_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    keywords = models.ManyToManyField(Keyword, related_name='ultimatedb', blank=True)
    scraped_bizinfo = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} ({self.corporation_number})"


class Lead(BaseModel):
    """
    User's leads that can be added to lead lists and used in campaigns.
    These can be imported from SalesOneLead or created manually.
    """
    corporation_number = models.CharField(max_length=13, verbose_name=_('Corporation Number'))
    business_number = models.CharField(max_length=10, null=True, blank=True, verbose_name=_('Business Number'))
    name = models.CharField(max_length=200, verbose_name=_('Company Name'))
    owner = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('Owner/CEO'))
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    homepage = models.JSONField(null=True, blank=True, verbose_name=_('Website URLs'))
    employee = models.IntegerField(default=1, verbose_name=_('Number of Employees'))
    revenue = models.BigIntegerField(null=True, blank=True, verbose_name=_('Annual Revenue'))
    address = models.TextField(null=True, blank=True)
    si_nm = models.CharField(max_length=50, null=True, blank=True, verbose_name=_('City/Province'))
    sgg_nm = models.CharField(max_length=50, null=True, blank=True, verbose_name=_('District'))
    established_date = models.DateField(null=True, blank=True)
    industry = models.ForeignKey(Industry, on_delete=models.SET_NULL, null=True, related_name='leads')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leads')
    
    class Meta:
        unique_together = ('corporation_number', 'user')
        
    def __str__(self):
        return f"{self.name} ({self.corporation_number})"


class LeadList(BaseModel):
    """
    A collection of leads that can be used in campaigns or for organization.
    """
    name = models.CharField(max_length=255, verbose_name=_('List Name'))
    description = models.TextField(null=True, blank=True)
    leads = models.ManyToManyField(Lead, related_name='lead_lists', blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lead_lists')
    
    def __str__(self):
        return self.name


class LeadImportTask(BaseModel):
    """
    Tracks the progress and results of lead import operations.
    """
    STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
    )
    
    task_id = models.CharField(max_length=50, unique=True, verbose_name=_('Celery Task ID'))
    file_name = models.CharField(max_length=255, verbose_name=_('Original File Name'))
    file_type = models.CharField(max_length=10, verbose_name=_('File Type'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_records = models.IntegerField(default=0, verbose_name=_('Total Records'))
    imported_records = models.IntegerField(default=0, verbose_name=_('Imported Records'))
    error_records = models.IntegerField(default=0, verbose_name=_('Error Records'))
    errors = models.JSONField(null=True, blank=True, verbose_name=_('Error Details'))
    lead_list = models.ForeignKey(LeadList, on_delete=models.SET_NULL, null=True, blank=True, related_name='import_tasks')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lead_import_tasks')
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Import {self.task_id} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Lead Import Task')
        verbose_name_plural = _('Lead Import Tasks')
