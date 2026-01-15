# Resend Email Integration

This backend uses [Resend](https://resend.com) to send transactional emails.

## Setup

1. Install dependencies (already done):
   ```bash
   npm install resend
   ```
2. Add your Resend API key to `.env`:
   ```env
   RESEND_API_KEY=your_resend_api_key
   ```

## Usage

Use the utility in `utils/resend.ts` to send emails:

```
ts
import { sendEmail } from '../utils/resend';

await sendEmail({
  to: 'recipient@example.com',
  subject: 'Subject',
  html: '<strong>Message</strong>',
});
```

See `scripts/sendTestResendEmail.ts` for a usage example.

## Notes
- Update the `from` address in `utils/resend.ts` to your verified sender.
- For more info, see [Resend docs](https://resend.com/docs).
