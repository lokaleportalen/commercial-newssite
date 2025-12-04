import "dotenv/config";
import { sendEmail } from "../lib/email";

async function testEmail() {
  console.log("Testing Mailgun email functionality...");
  console.log("Environment variables:");
  console.log("- MAILGUN_API_KEY:", process.env.MAILGUN_API_KEY ? "Set" : "Not set");
  console.log("- MAILGUN_DOMAIN:", process.env.MAILGUN_DOMAIN || "Not set");
  console.log("- MAILGUN_HOST:", process.env.MAILGUN_HOST || "Not set");
  console.log("\nSending test email to ek@digitaldisruptionmedia.com");

  try {
    const result = await sendEmail({
      to: "ek@digitaldisruptionmedia.com",
      subject: "Test Email from Estate News",
      text: "This is a test email to verify Mailgun integration is working correctly.",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify Mailgun integration is working correctly.</p>
        <p>If you received this, the integration is successful!</p>
        <hr>
        <p><small>Sent from Estate News</small></p>
      `,
    });

    console.log("✓ Email sent successfully!");
    console.log("Response:", result);
  } catch (error) {
    console.error("✗ Failed to send email:");
    console.error(error);
    process.exit(1);
  }
}

testEmail();
