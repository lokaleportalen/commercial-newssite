/**
 * Simple Mailgun test script
 * Run with: node test-mailgun.js
 */

const FormData = require("form-data");
const Mailgun = require("mailgun.js");

// Load environment variables
require("dotenv").config();

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: "https://api.eu.mailgun.net",
});

const domain = process.env.MAILGUN_DOMAIN || "";
const fromEmail = process.env.FROM_EMAIL || "nyheder@news.lokaleportalen.dk";
const fromName = process.env.FROM_NAME || "Nyheder";

console.log("Testing Mailgun configuration...\n");
console.log("Domain:", domain);
console.log("From Email:", fromEmail);
console.log("API Key:", process.env.MAILGUN_API_KEY ? "Set (hidden)" : "NOT SET");
console.log("\n---\n");

async function testMailgun() {
  try {
    // Test 1: Validate domain
    console.log("Test 1: Validating domain...");
    const domainInfo = await mg.domains.get(domain);
    console.log("✅ Domain validated:", domainInfo.state);
    console.log("   - State:", domainInfo.state);
    console.log("   - Created:", domainInfo.created_at);
    console.log("\n");

    // Test 2: Send test email using postmaster (recommended for initial setup)
    console.log("Test 2: Sending test email...");
    const result = await mg.messages.create(domain, {
      from: `Mailgun Test <postmaster@${domain}>`, // Use postmaster as recommended
      to: ["ek@digitaldisruptionmedia.com"],
      subject: "Mailgun Test Email",
      html: "<h1>Test Email</h1><p>If you receive this, Mailgun is working correctly!</p>",
      text: "Test Email - If you receive this, Mailgun is working correctly!",
    });

    console.log("✅ Email sent successfully!");
    console.log("   - Message ID:", result.id);
    console.log("   - Status:", result.status);
    console.log("\n");
    console.log("🎉 All tests passed! Check your inbox for the test email.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.status === 401) {
      console.error("\n💡 401 Unauthorized - Possible causes:");
      console.error("   1. API key is incorrect");
      console.error("   2. Using general API key instead of subdomain sending key");
      console.error("   3. Domain not verified in Mailgun");
    } else if (error.status === 404) {
      console.error("\n💡 404 Not Found - Domain doesn't exist in Mailgun");
      console.error("   - Check MAILGUN_DOMAIN is correct");
    }

    console.error("\nFull error details:", error);
  }
}

testMailgun();
