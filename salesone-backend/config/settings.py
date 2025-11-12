# Slack Configuration
SLACK_CONFIG = {
    'DEFAULT_WEBHOOK_URL': env('SLACK_DEFAULT_WEBHOOK_URL', default='https://hooks.slack.com/services/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'),
    'DEFAULT_BOT_NAME': env('SLACK_DEFAULT_BOT_NAME', default='SalesOne Bot'),
    'DEFAULT_BOT_ICON': env('SLACK_DEFAULT_BOT_ICON', default=':salesone:'),
    'WORKSPACE_ID': env('SLACK_WORKSPACE_ID', default=''),
    'BOT_TOKEN': env('SLACK_BOT_TOKEN', default=''),
} 