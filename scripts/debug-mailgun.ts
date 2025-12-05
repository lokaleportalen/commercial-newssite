import "dotenv/config";

console.log("=== Mailgun Configuration Debug ===\n");

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const host = process.env.MAILGUN_HOST;

console.log("Environment Variables:");
console.log(`MAILGUN_API_KEY: ${apiKey}`);
console.log(`MAILGUN_DOMAIN: ${domain}`);
console.log(`MAILGUN_HOST: ${host}`);
console.log();

console.log("API Key Analysis:");
console.log(`Length: ${apiKey?.length || 0} characters`);
console.log(`Format: ${apiKey?.includes('-') ? 'Contains dashes' : 'No dashes'}`);
console.log(`Starts with 'key-': ${apiKey?.startsWith('key-') ? 'Yes' : 'No'}`);
console.log();

console.log("Expected format for Mailgun API keys:");
console.log("- Private API key: 32+ hex characters (may start with 'key-')");
console.log("- Should look like: key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
console.log();

console.log("Current key structure:");
if (apiKey) {
  const parts = apiKey.split('-');
  console.log(`- Number of segments: ${parts.length}`);
  parts.forEach((part, i) => {
    console.log(`  Segment ${i + 1}: ${part.length} chars`);
  });
}
