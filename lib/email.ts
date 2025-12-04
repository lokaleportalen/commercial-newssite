import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

// Initialize Mailgun client
const apiKey = process.env.MAILGUN_API_KEY;
if (!apiKey) {
  throw new Error("MAILGUN_API_KEY environment variable is not set");
}

const mg = mailgun.client({
  username: "api",
  key: apiKey,
  url: process.env.MAILGUN_HOST || "https://api.eu.mailgun.net",
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, text, html, from } = options;

  const domain = process.env.MAILGUN_DOMAIN;
  if (!domain) {
    throw new Error("MAILGUN_DOMAIN is not configured");
  }

  try {
    const result = await mg.messages.create(domain, {
      from: from || `Estate News <noreply@${domain}>`,
      to: [to],
      subject,
      text,
      html: html || text,
    });

    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
