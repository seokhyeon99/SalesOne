import os
import sys
import django
import csv
from datetime import datetime
import json
from os import path

# Add the project root directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'salesone.settings')
django.setup()

from apps.leads.models import SalesOneLead, Industry
from django.db import transaction

def clean_integer(value):
    """Convert string to integer, return None if invalid"""
    try:
        return int(value) if value else None
    except ValueError:
        return None

def clean_boolean(value):
    """Convert string to boolean"""
    return value.lower() in ('true', '1', 'yes')

def clean_json_field(value):
    """Convert string to JSON array, handle empty values"""
    if not value:
        return []
    try:
        # If the value is already a string representation of a list
        if value.startswith('[') and value.endswith(']'):
            return json.loads(value)
        # If it's a single value, wrap it in a list
        return [value]
    except json.JSONDecodeError:
        return [value]

def import_salesone_leads():
    # Delete all existing SalesOneLead records
    SalesOneLead.objects.all().delete()

    csv_file = path.join(path.dirname(__file__), 'ultimate.csv')
    
    print(f"Starting SalesOne leads import from {csv_file}")
    start_time = datetime.now()
    
    # Create a dictionary of industries for faster lookup
    industry_map = {industry.name.replace(' ', ''): industry for industry in Industry.objects.all()}
    industry_map[None] = None
    industry_map[''] = None 
    
    batch_size = 1000
    total_imported = 0
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        batch = []
        
        for row in reader:
            # Get industry instance from the map
            industry_name = row.get('industry_name')
            industry = industry_map.get(industry_name.replace(' ', ''))
            
            
            # Convert string fields to appropriate types
            lead = SalesOneLead(
                corporation_number=row['corporation_number'],
                business_number=row.get('business_number'),
                industry=industry,
                industry_name=row.get('industry_name'),
                name=row['name'],
                name_eng=row.get('name_eng'),
                owner=row.get('owner'),
                email=row.get('email'),
                phone=row.get('phone'),
                homepage=clean_json_field(row.get('homepage')),
                handle_goods=clean_json_field(row.get('handle_goods')),
                employee=clean_integer(row.get('employee')) or 1,
                finance_currency_code=row.get('finance_currency_code'),
                finance_year=clean_integer(row.get('finance_year')),
                finance_revenue=clean_integer(row.get('finance_revenue')),
                finance_operating_profit=clean_integer(row.get('finance_operating_profit')),
                finance_comprehensive_income=clean_integer(row.get('finance_comprehensive_income')),
                finance_net_profit=clean_integer(row.get('finance_net_profit')),
                finance_total_assets=clean_integer(row.get('finance_total_assets')),
                finance_total_liabilities=clean_integer(row.get('finance_total_liabilities')),
                finance_total_equity=clean_integer(row.get('finance_total_equity')),
                finance_capital=clean_integer(row.get('finance_capital')),
                finance_debt_ratio=float(row['finance_debt_ratio']) if row.get('finance_debt_ratio') else None,
                is_normal_taxpayer=clean_boolean(row.get('is_normal_taxpayer', 'false')),
                is_corporation=clean_boolean(row.get('is_corporation', 'false')),
                address=row.get('address'),
                si_nm=row.get('si_nm'),
                sgg_nm=row.get('sgg_nm'),
                postal_code=row.get('postal_code'),
                established_date=row.get('established_date'),
                description=row.get('description'),
                scraped_bizinfo=clean_boolean(row.get('scraped_bizinfo', 'false')),
            )
            
            batch.append(lead)
            
            # Process in batches for better memory management
            if len(batch) >= batch_size:
                with transaction.atomic():
                    SalesOneLead.objects.bulk_create(
                        batch,
                        batch_size=batch_size,
                        ignore_conflicts=True  # Skip if record already exists
                    )
                total_imported += len(batch)
                print(f"Imported {total_imported} leads...")
                batch = []
        
        # Import any remaining records
        if batch:
            with transaction.atomic():
                SalesOneLead.objects.bulk_create(
                    batch,
                    batch_size=batch_size,
                    ignore_conflicts=True
                )
            total_imported += len(batch)
    
    end_time = datetime.now()
    duration = end_time - start_time
    print(f"SalesOne leads import completed in {duration}")
    print(f"Total leads imported: {total_imported}")

if __name__ == '__main__':
    import_salesone_leads() 