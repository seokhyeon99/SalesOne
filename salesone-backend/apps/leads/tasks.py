import os
import csv
import io
import pandas as pd
import uuid
from celery import shared_task
from django.conf import settings
from django.db import transaction
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from .models import Lead, Industry, LeadList, LeadImportTask


@shared_task(bind=True, max_retries=3)
def process_lead_file_import(self, file_path, user_id, file_type='csv', options=None):
    """
    Process imported lead data file (CSV or Excel).
    
    Args:
        file_path: Path to the uploaded file in storage
        user_id: ID of the user who uploaded the file
        file_type: Type of file ('csv' or 'excel')
        options: Additional import options (column mappings, etc.)
    
    Returns:
        dict: Results of the import process
    """
    import_task = None
    try:
        # Initialize import task record
        lead_list_id = options.get('lead_list_id') if options else None
        file_name = os.path.basename(file_path)
        
        import_task = LeadImportTask.objects.create(
            task_id=self.request.id,
            file_name=file_name,
            file_type=file_type,
            status='processing',
            user_id=user_id,
            lead_list_id=lead_list_id
        )
        
        # Initialize results
        results = {
            'total': 0,
            'imported': 0,
            'errors': [],
            'error_rows': [],
            'status': 'processing',
            'started_at': timezone.now().isoformat(),
            'completed_at': None
        }
        
        # Load data based on file type
        if file_type.lower() == 'csv':
            df = pd.read_csv(file_path)
        elif file_type.lower() in ['excel', 'xlsx', 'xls']:
            df = pd.read_excel(file_path)
        else:
            results['status'] = 'failed'
            results['errors'].append(f"Unsupported file type: {file_type}")
            
            if import_task:
                import_task.status = 'failed'
                import_task.errors = {'general': [f"Unsupported file type: {file_type}"]}
                import_task.completed_at = timezone.now()
                import_task.save()
                
            return results
        
        results['total'] = len(df)
        import_task.total_records = len(df)
        import_task.save()
        
        # Process each row
        imported_leads = []
        for index, row in df.iterrows():
            try:
                # Apply validation and transformation
                lead_data = validate_and_transform_lead_data(row, options)
                
                # Add user ID
                lead_data['user_id'] = user_id
                
                # Create lead in database
                with transaction.atomic():
                    lead = Lead.objects.create(**lead_data)
                    
                    # Add to lead list if specified
                    if lead_list_id:
                        try:
                            lead_list = LeadList.objects.get(id=lead_list_id, user_id=user_id)
                            lead_list.leads.add(lead)
                        except LeadList.DoesNotExist:
                            results['errors'].append(f"Lead list with ID {lead_list_id} not found.")
                    
                    imported_leads.append(lead)
                    results['imported'] += 1
                    import_task.imported_records += 1
                    import_task.save()
                
            except Exception as e:
                # Log the error and continue with next row
                error_info = {
                    'row': index + 2,  # +2 because index is 0-based and we need to account for header row
                    'data': row.to_dict(),
                    'error': str(e)
                }
                results['error_rows'].append(error_info)
                results['errors'].append(f"Error in row {index + 2}: {str(e)}")
                import_task.error_records += 1
                import_task.save()
        
        # Update final status
        results['status'] = 'completed'
        results['completed_at'] = timezone.now().isoformat()
        
        # Update import task record
        import_task.status = 'completed'
        import_task.completed_at = timezone.now()
        import_task.errors = {'rows': results['error_rows']} if results['error_rows'] else None
        import_task.save()
        
        # Clean up the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return results
        
    except Exception as e:
        # Handle unexpected errors
        if import_task:
            import_task.status = 'failed'
            import_task.errors = {'general': [str(e)]}
            import_task.completed_at = timezone.now()
            import_task.save()
            
        self.retry(exc=e, countdown=60 * 5)  # Retry after 5 minutes
        results = {
            'status': 'failed',
            'errors': [str(e)],
            'completed_at': timezone.now().isoformat()
        }
        return results


def validate_and_transform_lead_data(row_data, options=None):
    """
    Validate and transform a row of lead data.
    
    Args:
        row_data: Dictionary or Series containing lead data
        options: Import options including column mappings
    
    Returns:
        dict: Validated and transformed lead data ready for database insertion
    """
    # Convert pandas Series to dict if needed
    if hasattr(row_data, 'to_dict'):
        data = row_data.to_dict()
    else:
        data = dict(row_data)
    
    # Apply column mappings if provided
    if options and 'column_mapping' in options:
        mapped_data = {}
        for db_field, file_column in options['column_mapping'].items():
            if file_column in data:
                mapped_data[db_field] = data[file_column]
        data = mapped_data
    
    # Required fields validation
    required_fields = ['name', 'corporation_number']
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Missing required field: {field}")
    
    # Data type validation and transformation
    lead_data = {
        'name': str(data.get('name', '')).strip(),
        'corporation_number': str(data.get('corporation_number', '')).strip(),
        'business_number': str(data.get('business_number', '')).strip() if data.get('business_number') else None,
        'owner': str(data.get('owner', '')).strip() if data.get('owner') else None,
        'email': str(data.get('email', '')).strip() if data.get('email') else None,
        'phone': str(data.get('phone', '')).strip() if data.get('phone') else None,
        'homepage': [str(data.get('homepage', '')).strip()] if data.get('homepage') else None,
        'employee': int(data.get('employee', 1)) if data.get('employee') else 1,
        'revenue': int(data.get('revenue', 0)) if data.get('revenue') else None,
        'address': str(data.get('address', '')).strip() if data.get('address') else None,
        'si_nm': str(data.get('si_nm', '')).strip() if data.get('si_nm') else None,
        'sgg_nm': str(data.get('sgg_nm', '')).strip() if data.get('sgg_nm') else None,
    }
    
    # Special handling for dates
    if data.get('established_date'):
        try:
            # Convert to datetime and then to date
            established_date = pd.to_datetime(data['established_date']).date()
            lead_data['established_date'] = established_date
        except:
            lead_data['established_date'] = None
    
    # Handle industry if provided
    if data.get('industry_code'):
        try:
            industry = Industry.objects.get(code=data['industry_code'])
            lead_data['industry'] = industry
        except Industry.DoesNotExist:
            pass
            
    return lead_data 