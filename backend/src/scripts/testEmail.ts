import { EmailService } from '../services/email.service';
import { config } from '../config';

async function runTest() {
  console.log('====================================================');
  console.log('📧 Testing Biz List Place Gmail SMTP Configuration...');
  console.log('====================================================');
  console.log('Host:      ', config.email.smtpHost);
  console.log('Port:      ', config.email.smtpPort);
  console.log('Secure:    ', config.email.smtpSecure);
  console.log('From User: ', config.email.smtpUser);
  console.log('From Name: ', config.email.fromName);
  console.log('Admin Email:', config.email.adminEmail);
  console.log('----------------------------------------------------');

  console.log('1. Verifying SMTP Connection with Gmail...');
  const verifyResult = await EmailService.verifyConnection();
  console.log('Verification result:', verifyResult);

  if (!verifyResult.success) {
    console.error('❌ SMTP verification failed:', verifyResult.message);
    process.exit(1);
  }

  console.log('✅ SMTP connection successful!');
  console.log('----------------------------------------------------');
  console.log(`2. Dispatching real test email to ${config.email.adminEmail}...`);

  const sendResult = await EmailService.sendTestEmail(config.email.adminEmail);
  console.log('Send result:', sendResult);

  if (sendResult.success) {
    console.log('====================================================');
    console.log('🎉 SUCCESS! Real test email sent successfully.');
    console.log('Message ID:', sendResult.messageId);
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error('❌ Failed to send email:', sendResult.error);
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

