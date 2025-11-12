from django.apps import AppConfig


class WorkflowsConfig(AppConfig):
    name = 'apps.workflows'
    verbose_name = 'Workflows'
    
    def ready(self):
        # Import signals and register any app initialization
        import apps.workflows.signals 