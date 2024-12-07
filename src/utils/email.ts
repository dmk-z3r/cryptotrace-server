import logger from './logger';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  key: process.env.MAILGUN_API_KEY!,
  url: 'https://api.eu.mailgun.net',
  username: 'api',
});

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<void> {
  const data: any = {
    from: `CryptoTrace <no-reply@${process.env.MAILGUN_DOMAIN}>`,
    to,
    subject,
    text,
  };

  if (html) {
    data.html = html;
  }

  mg.messages.create(process.env.MAILGUN_DOMAIN!, data).then(() => {
    logger.info(`Email sent to ${to}`);
  }).catch (error => {
    logger.error(`Error sending email: ${error}`);
    throw new Error('Failed to send email');
  }).finally(() => {
    return;
  });
}
