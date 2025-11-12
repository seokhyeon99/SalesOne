from django.core.management.base import BaseCommand
from django.contrib.postgres.search import SearchVector
from django.db import transaction
from apps.leads.models import Lead, SalesOneLead
import time
import sys


class Command(BaseCommand):
    help = 'Populate search vectors for Lead and SalesOneLead models'

    def add_arguments(self, parser):
        parser.add_argument(
            '--model',
            type=str,
            choices=['lead', 'salesonelead', 'all'],
            default='all',
            help='Specify which model to update: lead, salesonelead, or all'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1000,
            help='Number of records to process in each batch'
        )

    def handle(self, *args, **options):
        model = options['model']
        batch_size = options['batch_size']
        
        if model in ['lead', 'all']:
            self.update_lead_search_vectors(batch_size)
        
        if model in ['salesonelead', 'all']:
            self.update_salesone_lead_search_vectors(batch_size)
            
        self.stdout.write(self.style.SUCCESS('Search vectors populated successfully'))

    def update_lead_search_vectors(self, batch_size):
        """Update search vectors for Lead model in batches"""
        self.stdout.write('Updating Lead search vectors...')
        
        # Get leads with null search_vector
        leads_to_update = Lead.objects.filter(search_vector__isnull=True)
        total_leads = leads_to_update.count()
        
        if total_leads == 0:
            self.stdout.write('No Lead records need updating')
            return
            
        self.stdout.write(f'Found {total_leads} Lead records to update')
        
        # Process in batches
        offset = 0
        start_time = time.time()
        
        while offset < total_leads:
            batch = leads_to_update[offset:offset + batch_size]
            
            # Update each lead in the batch
            with transaction.atomic():
                for lead in batch:
                    Lead.objects.filter(id=lead.id).update(search_vector=
                        SearchVector('name', weight='A') +
                        SearchVector('owner', weight='B') +
                        SearchVector('corporation_number', weight='A') +
                        SearchVector('business_number', weight='B') +
                        SearchVector('address', weight='C') +
                        SearchVector('si_nm', weight='C') +
                        SearchVector('sgg_nm', weight='C')
                    )
            
            # Update progress
            offset += batch_size
            progress = min(offset, total_leads) / total_leads * 100
            elapsed_time = time.time() - start_time
            self.stdout.write(f'Progress: {progress:.1f}% ({min(offset, total_leads)}/{total_leads}) - Time elapsed: {elapsed_time:.1f}s')
            sys.stdout.flush()
    
    def update_salesone_lead_search_vectors(self, batch_size):
        """Update search vectors for SalesOneLead model in batches"""
        self.stdout.write('Updating SalesOneLead search vectors...')
        
        # Get leads with null search_vector
        leads_to_update = SalesOneLead.objects.filter(search_vector__isnull=True)
        total_leads = leads_to_update.count()
        
        if total_leads == 0:
            self.stdout.write('No SalesOneLead records need updating')
            return
            
        self.stdout.write(f'Found {total_leads} SalesOneLead records to update')
        
        # Process in batches
        offset = 0
        start_time = time.time()
        
        while offset < total_leads:
            batch = leads_to_update[offset:offset + batch_size]
            
            # Update each lead in the batch
            with transaction.atomic():
                for lead in batch:
                    SalesOneLead.objects.filter(id=lead.id).update(search_vector=
                        SearchVector('name', weight='A') +
                        SearchVector('name_eng', weight='B') +
                        SearchVector('owner', weight='B') +
                        SearchVector('corporation_number', weight='A') +
                        SearchVector('business_number', weight='B') +
                        SearchVector('address', weight='C') +
                        SearchVector('si_nm', weight='C') +
                        SearchVector('sgg_nm', weight='C') +
                        SearchVector('industry_name', weight='B')
                    )
            
            # Update progress
            offset += batch_size
            progress = min(offset, total_leads) / total_leads * 100
            elapsed_time = time.time() - start_time
            self.stdout.write(f'Progress: {progress:.1f}% ({min(offset, total_leads)}/{total_leads}) - Time elapsed: {elapsed_time:.1f}s')
            sys.stdout.flush() 