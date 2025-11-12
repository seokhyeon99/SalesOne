import os
import sys
import django
import csv
from datetime import datetime

# Add the project root directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'salesone.settings')
django.setup()

from apps.leads.models import Industry
from os import path

def import_industries():
    csv_file = path.join(path.dirname(__file__), 'industry.csv')
    
    print(f"Starting industry import from {csv_file}")
    start_time = datetime.now()
    
    # Create industries in bulk
    industries_to_create = []
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            industry = Industry(
                code=row['code'],
                name=row['name']
            )
            industries_to_create.append(industry)
    
    # Use bulk_create for better performance
    batch_size = 1000
    Industry.objects.bulk_create(
        industries_to_create,
        batch_size=batch_size,
        ignore_conflicts=True  # Skip if record already exists
    )
    
    end_time = datetime.now()
    duration = end_time - start_time
    print(f"Industry import completed in {duration}")
    print(f"Total industries imported: {len(industries_to_create)}")

if __name__ == '__main__':
    import_industries() 