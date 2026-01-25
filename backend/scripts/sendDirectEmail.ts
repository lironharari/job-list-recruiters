import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const usage = () => {
  console.log('Usage: ts-node scripts/sendDirectEmail.ts <to> <subject> <htmlBody>');
  process.exit(1);
};

const main = async () => {
  const [, , to, subject, htmlBody] = process.argv;
  if (!to || !subject || !htmlBody) usage();

  // prefer configured SMTP, otherwise use Ethereal test account
  let transporter: nodemailer.Transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log('No SMTP configured — creating Ethereal test account');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: htmlBody,
    });

    console.log('Message sent:', info.messageId || '(no id)');
    const preview = (nodemailer as any).getTestMessageUrl(info);
    if (preview) console.log('Preview URL:', preview);
  } catch (err: any) {
    console.error('Send failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(2);
  });
