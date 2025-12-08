import { db } from "../db";
import { systemSettings } from "../schema/system-settings-schema";

export async function seedSystemSettings() {
  console.log("Seeding system settings...");

  const settings = [
    {
      key: "ai_provider",
      value: "openai", // Default to OpenAI
      description: "AI provider for article generation (openai, gemini, claude)",
    },
  ];

  await db.insert(systemSettings).values(settings);

  console.log(`✓ Created ${settings.length} system settings`);
}
