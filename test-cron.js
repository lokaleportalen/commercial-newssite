// Simple script to test the cron endpoint
// Usage:
//   node test-cron.js       (test local)
//   node test-cron.js prod  (test production)

const isProd = process.argv[2] === "prod";
const BASE_URL = isProd
  ? "https://commercial-newssite.vercel.app"
  : "http://localhost:3000";
const CRON_SECRET =
  process.env.CRON_SECRET || "/oTrDBGD8SMovGNxVjaHadHV0Qfu6R5/6ffpBWVknf8=";

async function testCron() {
  console.log(isProd ? "🌐 Testing PRODUCTION" : "💻 Testing LOCAL");
  console.log("URL:", `${BASE_URL}/api/cron/weekly-news`);
  console.log("\n⏳ Sending request (this may take 1-2 minutes)...\n");

  try {
    const response = await fetch(`${BASE_URL}/api/cron/weekly-news`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    console.log("Status:", response.status, response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("\nResponse body:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ Success!");
    } else {
      console.log("\n❌ Error!");
    }
  } catch (error) {
    console.error("❌ Failed to call endpoint:");
    console.error(error.message);
  }
}

testCron();
