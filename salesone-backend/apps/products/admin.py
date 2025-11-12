from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan_type_display', 'formatted_price', 'is_active', 'created_by', 'created_at')
    list_filter = ('is_active', 'plan_type', 'currency')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'description')
        }),
        ('가격 정보', {
            'fields': ('price', 'currency', 'plan_type')
        }),
        ('상태', {
            'fields': ('is_active',)
        }),
        ('시스템 정보', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def plan_type_display(self, obj):
        return obj.get_plan_type_display()
    plan_type_display.short_description = '결제 유형'
    
    def formatted_price(self, obj):
        return f"{obj.price:,} {obj.currency.upper()}"
    formatted_price.short_description = '가격' 