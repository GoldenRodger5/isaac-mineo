// Quick test script to verify Resend API key works
// Run with: node test-resend.js

async function testResend() {
  const RESEND_API_KEY = 're_LcFXASQC_E9C1kztuam1Nap5aW5x37Pbc';
  
  try {
    console.log('🧪 Testing Resend API...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Isaac Portfolio <onboarding@resend.dev>',
        to: ['isaacmineo@gmail.com'],
        subject: 'Test Email from Vercel Function',
        html: '<h1>Success!</h1><p>Your Resend API is working correctly.</p><p>The Vercel contact form backup is ready to use.</p>',
        text: 'Success! Your Resend API is working correctly. The Vercel contact form backup is ready to use.'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Resend API Error:', response.status, errorData);
      return false;
    }

    const result = await response.json();
    console.log('✅ Email sent successfully!');
    console.log('📧 Email ID:', result.id);
    console.log('🎉 Vercel contact form backup is ready!');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing Resend:', error.message);
    return false;
  }
}

// Run the test
testResend().then(success => {
  if (success) {
    console.log('\n✅ All systems go! Your backup contact form is ready.');
  } else {
    console.log('\n❌ Please check your Resend API key and try again.');
  }
});
