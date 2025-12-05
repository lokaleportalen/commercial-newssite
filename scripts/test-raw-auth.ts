import "dotenv/config";

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;

console.log("=== Raw Authentication Test ===\n");

console.log("Testing different authentication methods...\n");

// Method 1: Basic Auth with Buffer
async function testWithBuffer() {
  console.log("--- Method 1: Basic Auth (Buffer encoding) ---");

  const auth = Buffer.from(`api:${apiKey}`).toString("base64");
  console.log(`Auth header: Basic ${auth.substring(0, 20)}...`);

  try {
    const response = await fetch(
      `https://api.eu.mailgun.net/v3/${domain}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          from: `Test <mailgun@${domain}>`,
          to: "ek@digitaldisruptionmedia.com",
          subject: "Test 1",
          text: "Test message 1",
        }).toString(),
      }
    );

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}\n`);

    return response.ok;
  } catch (error: any) {
    console.log(`Error: ${error.message}\n`);
    return false;
  }
}

// Method 2: Using fetch with basic auth in URL
async function testWithUrlAuth() {
  console.log("--- Method 2: Auth in URL ---");

  try {
    const response = await fetch(
      `https://api:${apiKey}@api.eu.mailgun.net/v3/${domain}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          from: `Test <mailgun@${domain}>`,
          to: "ek@digitaldisruptionmedia.com",
          subject: "Test 2",
          text: "Test message 2",
        }).toString(),
      }
    );

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}\n`);

    return response.ok;
  } catch (error: any) {
    console.log(`Error: ${error.message}\n`);
    return false;
  }
}

// Method 3: Check API key validation endpoint
async function testApiKeyValidity() {
  console.log("--- Method 3: Validate API Key (GET /domains) ---");

  const auth = Buffer.from(`api:${apiKey}`).toString("base64");

  try {
    const response = await fetch(
      `https://api.eu.mailgun.net/v4/domains`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
        },
      }
    );

    console.log(`Status: ${response.status}`);
    const text = await response.text();

    if (response.ok) {
      console.log("✅ API Key is VALID - can access domain list");
      try {
        const json = JSON.parse(text);
        console.log(`Found ${json.items?.length || 0} domains`);
        if (json.items) {
          json.items.forEach((d: any) => {
            console.log(`  - ${d.name} (${d.state})`);
          });
        }
      } catch (e) {
        console.log(text);
      }
    } else {
      console.log("❌ API Key validation failed");
      console.log(`Response: ${text}`);
    }
    console.log();

    return response.ok;
  } catch (error: any) {
    console.log(`Error: ${error.message}\n`);
    return false;
  }
}

// Method 4: Test with multipart/form-data
async function testWithFormData() {
  console.log("--- Method 4: multipart/form-data ---");

  const FormData = (await import("form-data")).default;
  const form = new FormData();
  form.append("from", `Test <mailgun@${domain}>`);
  form.append("to", "ek@digitaldisruptionmedia.com");
  form.append("subject", "Test 4");
  form.append("text", "Test message 4");

  const auth = Buffer.from(`api:${apiKey}`).toString("base64");

  try {
    const response = await fetch(
      `https://api.eu.mailgun.net/v3/${domain}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          ...form.getHeaders(),
        },
        body: form as any,
      }
    );

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}\n`);

    return response.ok;
  } catch (error: any) {
    console.log(`Error: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log(`Domain: ${domain}`);
  console.log(`API Key length: ${apiKey?.length} chars`);
  console.log(`API Key format: ${apiKey?.includes('-') ? 'Has dashes' : 'No dashes'}`);
  console.log();

  // First, validate the API key works at all
  const keyValid = await testApiKeyValidity();

  if (!keyValid) {
    console.log("❌ API KEY IS INVALID OR HAS NO PERMISSIONS");
    console.log("\nPlease verify:");
    console.log("1. You copied the ENTIRE API key (including any 'key-' prefix)");
    console.log("2. You're using the Private API Key (not Domain Sending Key)");
    console.log("3. The API key hasn't been deleted or regenerated");
    return;
  }

  console.log("API key is valid! Testing send methods...\n");

  await testWithBuffer();
  await testWithUrlAuth();
  await testWithFormData();

  console.log("\n=== DIAGNOSIS ===");
  console.log("If all methods failed with 'Forbidden', possible causes:");
  console.log("1. Domain-specific restrictions (check domain settings in dashboard)");
  console.log("2. IP allowlist enabled (your IP might not be allowed)");
  console.log("3. Account-level sending restrictions");
  console.log("4. The 'from' address might need to match a specific pattern");
  console.log("5. Enterprise plan custom restrictions");
}

runTests();
