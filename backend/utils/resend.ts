import { Resend } from 'resend';

const resend = new Resend("re_c33RM8Gj_A21AXsLcKbTsAjuWDDeSyPzk");

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Liron Harari <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
}
