// lib/email-templates.ts

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
}

export function getWelcomeEmail({ userName, userEmail }: WelcomeEmailProps) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Lokale Portalen!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}! 👋</h2>
            <p>Thanks for signing up! We're excited to have you on board.</p>
            <p>You'll now receive curated local news articles based on your preferences. We'll keep you informed about what matters most to you.</p>
            <p>You can manage your email preferences anytime from your account settings.</p>
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/dashboard" class="button">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email - we're here to help!</p>
            <p>Lokale Portalen | Your local news, curated</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome to Lokale Portalen!

Hi ${userName}!

Thanks for signing up! We're excited to have you on board.

You'll now receive curated local news articles based on your preferences. We'll keep you informed about what matters most to you.

You can manage your email preferences anytime from your account settings.

Visit your dashboard: ${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/dashboard

Questions? Reply to this email - we're here to help!

Lokale Portalen | Your local news, curated
  `;

  return {
    subject: "Welcome to Lokaleportalen!",
    html,
    text,
  };
}
