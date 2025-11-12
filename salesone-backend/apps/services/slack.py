import json
import logging
import requests
from django.conf import settings
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SlackService:
    """
    Service for sending messages to Slack.
    """
    
    @staticmethod
    def send_message(
        channel: str,
        message: str,
        username: Optional[str] = None,
        icon_emoji: Optional[str] = None,
        attachments: Optional[str] = None,
        webhook_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a message to Slack using webhooks.
        
        Args:
            channel: The channel to send the message to
            message: The message text
            username: Optional bot username
            icon_emoji: Optional bot icon emoji
            attachments: Optional message attachments (JSON string)
            webhook_url: Optional custom webhook URL
            
        Returns:
            Response data from Slack
        """
        try:
            # Use provided webhook URL or fall back to default
            url = webhook_url or settings.SLACK_CONFIG['DEFAULT_WEBHOOK_URL']
            
            if not url:
                raise ValueError("No Slack webhook URL configured")
                
            # Prepare payload
            payload = {
                'channel': channel,
                'text': message,
                'username': username or settings.SLACK_CONFIG['DEFAULT_BOT_NAME'],
                'icon_emoji': icon_emoji or settings.SLACK_CONFIG['DEFAULT_BOT_ICON'],
            }
            
            # Add attachments if provided
            if attachments:
                try:
                    payload['attachments'] = json.loads(attachments)
                except json.JSONDecodeError:
                    logger.warning("Invalid attachments JSON, skipping attachments")
            
            # Send request to Slack
            response = requests.post(url, json=payload)
            response.raise_for_status()
            
            return {
                'success': True,
                'status_code': response.status_code,
                'response': response.text
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending Slack message: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error sending Slack message: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

# Create a singleton instance
slack_service = SlackService() 