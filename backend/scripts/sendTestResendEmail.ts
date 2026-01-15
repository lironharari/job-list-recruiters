import { sendEmail } from '../utils/resend';

// Example usage
async function testSend() {
  try {
    const result = await sendEmail({
      to: 'lironharari@gmail.com',
      subject: 'Test Email from Resend',
      html: '<strong>Hello from Resend!</strong>',
    });
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testSend();
