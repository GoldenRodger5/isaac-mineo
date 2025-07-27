// Vercel Serverless Function for Contact Form
// Backup solution using Resend API

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Method not allowed' 
    });
  }

  try {
    const { name, email, subject, message, interest } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, email, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Prepare email content
    const emailSubject = `Portfolio Contact: ${subject || 'New Message'}`;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .field { margin-bottom: 12px; }
        .label { font-weight: bold; color: #374151; }
        .value { margin-left: 10px; color: #1f2937; }
        .message-box { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">From isaacmineo.com</p>
    </div>
    
    <div class="content">
        <div class="field">
            <span class="label">Name:</span>
            <span class="value">${name}</span>
        </div>
        <div class="field">
            <span class="label">Email:</span>
            <span class="value">${email}</span>
        </div>
        <div class="field">
            <span class="label">Subject:</span>
            <span class="value">${subject || 'No subject'}</span>
        </div>
        <div class="field">
            <span class="label">Interest:</span>
            <span class="value">${interest || 'Not specified'}</span>
        </div>
    </div>
    
    <div>
        <h3 style="color: #1f2937; margin-bottom: 10px;">Message:</h3>
        <div class="message-box">${message}</div>
    </div>
    
    <div class="footer">
        <p>Sent via Vercel serverless function</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
    </div>
</body>
</html>`;

    // Text version for email clients that don't support HTML
    const emailText = `
New Contact Form Submission - Isaac Mineo Portfolio

From: ${name}
Email: ${email}
Subject: ${subject || 'No subject'}
Interest: ${interest || 'Not specified'}

Message:
${message}

---
Sent from isaacmineo.com via Vercel function
Timestamp: ${new Date().toISOString()}
    `.trim();

    // Send email using Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({
        status: 'error',
        message: 'Email service not configured'
      });
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Isaac Portfolio <onboarding@resend.dev>',
        to: ['isaacmineo@gmail.com'],
        reply_to: email,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', errorData);
      throw new Error(`Resend API error: ${emailResponse.status}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult.id);

    // Success response
    return res.status(200).json({
      status: 'success',
      message: 'Thank you for your message! Isaac will get back to you soon.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to send message. Please try again or email Isaac directly at isaacmineo@gmail.com.',
      timestamp: new Date().toISOString()
    });
  }
}
