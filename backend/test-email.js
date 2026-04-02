const { sendCredentialsEmail } = require('./utils/emailService');

async function testEmail() {
  try {
    console.log('🧪 Testing email service...');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

    const result = await sendCredentialsEmail('baghelroshansingh2005@gmail.com', 'testpassword123');
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();