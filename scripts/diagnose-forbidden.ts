import "dotenv/config";

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;

console.log("=== Mailgun Forbidden Error Diagnostic ===\n");

// Test both US and EU endpoints
const endpoints = [
  { name: "EU", url: "https://api.eu.mailgun.net" },
  { name: "US", url: "https://api.mailgun.net" },
];

async function testEndpoint(endpoint: { name: string; url: string }) {
  console.log(`\n--- Testing ${endpoint.name} Endpoint ---`);
  console.log(`URL: ${endpoint.url}/v3/${domain}/messages\n`);

  try {
    const response = await fetch(
      `${endpoint.url}/v3/${domain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          from: `Test <noreply@${domain}>`,
          to: "ek@digitaldisruptionmedia.com",
          subject: "Mailgun Test",
          text: "Test email",
        }),
      }
    );

    console.log(`Status: ${response.status} ${response.statusText}`);

    const text = await response.text();

    if (response.ok) {
      console.log("✅ SUCCESS!");
      console.log("Response:", text);
      return true;
    } else {
      console.log("❌ FAILED");
      console.log("Response body:", text);

      // Try to parse as JSON for better error details
      try {
        const json = JSON.parse(text);
        console.log("\nError details:");
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        // Not JSON, already printed above
      }

      return false;
    }
  } catch (error: any) {
    console.log("❌ REQUEST FAILED");
    console.log("Error:", error.message);
    return false;
  }
}

async function diagnose() {
  console.log("Config:");
  console.log(`- Domain: ${domain}`);
  console.log(`- API Key: ${apiKey?.substring(0, 15)}...`);
  console.log();

  let success = false;

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    if (result) {
      success = true;
      console.log(`\n✅ SUCCESS! Use this endpoint: ${endpoint.url}`);
      break;
    }
  }

  if (!success) {
    console.log("\n\n=== TROUBLESHOOTING ===");
    console.log("\n❌ Both endpoints failed. Common causes:");
    console.log("\n1. BILLING/ACCOUNT ISSUE:");
    console.log("   → Check Mailgun Dashboard > Billing");
    console.log("   → Verify payment method is added");
    console.log("   → Check if free trial expired");
    console.log("   → Look for any account suspension notices");

    console.log("\n2. DOMAIN DISABLED:");
    console.log("   → Check Mailgun Dashboard > Sending > Domains");
    console.log("   → Verify domain status is 'Active' (not 'Disabled')");

    console.log("\n3. SENDING KEY PERMISSIONS:");
    console.log("   → Your key might be a Sending Key with restricted permissions");
    console.log("   → Try using the Primary Account API Key instead");
    console.log("   → Find it: Dashboard > Account Settings > API Keys");

    console.log("\n4. ACCOUNT LIMITS:");
    console.log("   → Check if you've hit sending limits");
    console.log("   → Dashboard > Account Settings > Limits");

    console.log("\n5. SANDBOX RESTRICTIONS:");
    console.log("   → If this is a sandbox domain, add authorized recipient:");
    console.log("   → Dashboard > Sending > Domain > Authorized Recipients");
    console.log("   → Add: ek@digitaldisruptionmedia.com");
  }
}

diagnose();
