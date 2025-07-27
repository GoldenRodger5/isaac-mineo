import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.getenv("SENDER_EMAIL", "noreply@isaacmineo.com")
        self.sender_password = os.getenv("SENDER_PASSWORD")
        self.recipient_email = "IsaacMineo@gmail.com"
        
    async def send_contact_email(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send contact form email to Isaac"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = f"Portfolio Contact: {contact_data.get('subject', 'New Message')}"
            message["From"] = self.sender_email
            message["To"] = self.recipient_email
            message["Reply-To"] = contact_data.get('email', '')
            
            # Create HTML and text versions
            text_body = self._create_text_body(contact_data)
            html_body = self._create_html_body(contact_data)
            
            # Attach parts
            text_part = MIMEText(text_body, "plain")
            html_part = MIMEText(html_body, "html")
            
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.sender_password:
                    server.login(self.sender_email, self.sender_password)
                
                server.send_message(message)
                
            logger.info(f"Contact email sent successfully from {contact_data.get('email')}")
            
            return {
                "status": "success",
                "message": "Email sent successfully"
            }
            
        except Exception as error:
            logger.error(f"Failed to send contact email: {str(error)}")
            
            # Fallback: Log the message for manual follow-up
            self._log_contact_message(contact_data)
            
            return {
                "status": "error", 
                "message": "Failed to send email, but message has been logged",
                "error": str(error)
            }
    
    def _create_text_body(self, contact_data: Dict[str, Any]) -> str:
        """Create plain text email body"""
        return f"""
New Contact Form Submission - Isaac Mineo Portfolio

From: {contact_data.get('name', 'Unknown')}
Email: {contact_data.get('email', 'Not provided')}
Interest: {contact_data.get('interest', 'Not specified')}
Subject: {contact_data.get('subject', 'No subject')}

Message:
{contact_data.get('message', 'No message provided')}

---
Sent from isaacmineo.com contact form
        """.strip()
    
    def _create_html_body(self, contact_data: Dict[str, Any]) -> str:
        """Create HTML email body"""
        interest_badge_color = {
            'Full-Stack Development': '#3B82F6',
            'AI Engineering': '#8B5CF6', 
            'Backend Development': '#10B981',
            'HealthTech Projects': '#F59E0B',
            'Developer Tooling': '#EF4444',
            'Collaboration': '#6366F1',
            'Other': '#6B7280'
        }
        
        badge_color = interest_badge_color.get(contact_data.get('interest', ''), '#6B7280')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Contact Form Submission</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">From your portfolio website</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">Contact Information</h2>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #374151;">Name:</strong>
                    <span style="margin-left: 10px; color: #1f2937;">{contact_data.get('name', 'Not provided')}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #374151;">Email:</strong>
                    <a href="mailto:{contact_data.get('email', '')}" style="margin-left: 10px; color: #3b82f6; text-decoration: none;">{contact_data.get('email', 'Not provided')}</a>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #374151;">Subject:</strong>
                    <span style="margin-left: 10px; color: #1f2937;">{contact_data.get('subject', 'No subject')}</span>
                </div>
                
                <div style="margin-bottom: 0;">
                    <strong style="color: #374151;">Interest:</strong>
                    <span style="margin-left: 10px; background-color: {badge_color}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">{contact_data.get('interest', 'Not specified')}</span>
                </div>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Message</h2>
                <div style="color: #374151; white-space: pre-wrap; line-height: 1.6;">
{contact_data.get('message', 'No message provided')}
                </div>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">⚡ Quick Actions</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <a href="mailto:{contact_data.get('email', '')}" style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">Reply via Email</a>
                    <a href="https://linkedin.com/in/isaacmineo" style="background: #0077b5; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">View LinkedIn</a>
                </div>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <p style="margin: 0;">Sent from <a href="https://isaacmineo.com" style="color: #3b82f6; text-decoration: none;">isaacmineo.com</a> contact form</p>
                <p style="margin: 5px 0 0 0;">Timestamp: {contact_data.get('timestamp', 'Not available')}</p>
            </div>
        </body>
        </html>
        """.strip()
    
    def _log_contact_message(self, contact_data: Dict[str, Any]) -> None:
        """Log contact message as fallback when email fails"""
        logger.info("=== CONTACT FORM SUBMISSION ===")
        logger.info(f"Name: {contact_data.get('name')}")
        logger.info(f"Email: {contact_data.get('email')}")
        logger.info(f"Interest: {contact_data.get('interest')}")
        logger.info(f"Subject: {contact_data.get('subject')}")
        logger.info(f"Message: {contact_data.get('message')}")
        logger.info("==============================")

# Create singleton instance
email_service = EmailService()
