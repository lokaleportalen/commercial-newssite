import "dotenv/config";
import formData from "form-data";
import Mailgun from "mailgun.js";

async function verifyMailgun() {
  console.log("Verifying Mailgun configuration...\n");

  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const host = process.env.MAILGUN_HOST;

  console.log("Environment variables:");
  console.log("- MAILGUN_API_KEY:", apiKey ? `${apiKey.substring(0, 10)}...` : "Not set");
  console.log("- MAILGUN_DOMAIN:", domain || "Not set");
  console.log("- MAILGUN_HOST:", host || "Not set");

  if (!apiKey || !domain) {
    console.error("\n✗ Missing required environment variables");
    process.exit(1);
  }

  try {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: "api",
      key: apiKey,
      url: host || "https://api.eu.mailgun.net",
    });

    console.log("\n✓ Mailgun client initialized");
    console.log("\nAttempting to fetch domain info...");

    // Try to get domain info
    const domainInfo = await mg.domains.get(domain);
    console.log("✓ Domain verified!");
    console.log("Domain info:", JSON.stringify(domainInfo, null, 2));
  } catch (error: any) {
    console.error("\n✗ Failed to verify Mailgun configuration:");
    console.error("Error:", error.message);
    console.error("Status:", error.status);
    console.error("Details:", error.details);
    console.error("\nPossible issues:");
    console.error("1. API key might be incorrect");
    console.error("2. Domain might not be verified in Mailgun");
    console.error("3. Wrong Mailgun region (EU vs US)");
    console.error("4. API key might not have sufficient permissions");
    process.exit(1);
  }
}

verifyMailgun();
