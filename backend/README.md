[Live App](https://drushim.onrender.com)

# Job List Recruiters Backend

This is the backend for the Job List Recruiters project, a job board and recruiter management platform. It provides RESTful APIs for job posting, application management, authentication, and email notifications.

## Technologies Used

- **Node.js** – JavaScript runtime
- **Express** – Web framework for building REST APIs
- **TypeScript** – Type safety for backend logic
- **MongoDB** – Database for jobs, users, and applications
- **Resend** – Transactional email service
- **Jest** – Testing framework
- **Dotenv** – Environment variable management

## Features

- Job CRUD (create, read, update, delete)
- Application submission and management
- User authentication and roles (admin, recruiter, applicant)
- Email notifications and templates
- RESTful API endpoints
- Secure file upload for resumes

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your environment variables to `.env`:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   RESEND_API_KEY=your_resend_api_key
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## Email Integration

This backend uses [Resend](https://resend.com) to send transactional emails.

Use the utility in `utils/resend.ts` to send emails:

```ts
import { sendEmail } from '../utils/resend';

await sendEmail({
  to: 'recipient@example.com',
  subject: 'Subject',
  html: '<strong>Message</strong>',
});
```

See `scripts/sendTestResendEmail.ts` for a usage example.

## Project Structure

- `models/` – Mongoose models for jobs, users, applications
- `routes/` – Express route handlers
- `middleware/` – Authentication and error handling
- `utils/` – Utility functions (email, auth, etc.)
- `scripts/` – Data seeding and email testing scripts

## Notes
- Update the `from` address in `utils/resend.ts` to your verified sender.
- For more info, see [Resend docs](https://resend.com/docs).
