import { db } from "@/database/db";
import { aiPrompt } from "@/database/schema";
import { eq } from "drizzle-orm";

/**
 * Get an AI prompt by its key
 * @param key - The unique key for the prompt (e.g., "news_fetch", "article_research")
 * @returns The prompt text or null if not found
 */
export async function getAiPrompt(key: string): Promise<string | null> {
  try {
    const prompts = await db
      .select()
      .from(aiPrompt)
      .where(eq(aiPrompt.key, key))
      .limit(1);

    if (prompts.length === 0) {
      console.warn(`AI prompt with key "${key}" not found in database`);
      return null;
    }

    return prompts[0].prompt;
  } catch (error) {
    console.error(`Error fetching AI prompt with key "${key}":`, error);
    return null;
  }
}

/**
 * Get an AI prompt by its key with variable substitution
 * @param key - The unique key for the prompt
 * @param variables - Object containing variables to substitute in the prompt
 * @returns The prompt text with variables substituted, or null if not found
 */
export async function getAiPromptWithVars(
  key: string,
  variables: Record<string, string>
): Promise<string | null> {
  const prompt = await getAiPrompt(key);
  if (!prompt) return null;

  // Simple template variable substitution
  let result = prompt;
  for (const [varName, value] of Object.entries(variables)) {
    // Replace {{varName}} with value
    result = result.replace(new RegExp(`\\{\\{${varName}\\}\\}`, "g"), value);

    // Also handle conditional blocks {{#if varName}}...{{/if}}
    const ifRegex = new RegExp(
      `\\{\\{#if ${varName}\\}\\}(.*?)\\{\\{/if\\}\\}`,
      "gs"
    );
    if (value) {
      // If value exists, keep the content but remove the conditional tags
      result = result.replace(ifRegex, "$1");
    } else {
      // If value doesn't exist, remove the entire conditional block
      result = result.replace(ifRegex, "");
    }
  }

  return result;
}

/**
 * Cache for AI prompts to reduce database queries
 * In production, consider using Redis or similar for distributed caching
 */
const promptCache = new Map<string, { prompt: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get an AI prompt with caching
 * @param key - The unique key for the prompt
 * @returns The prompt text or null if not found
 */
export async function getCachedAiPrompt(key: string): Promise<string | null> {
  const cached = promptCache.get(key);
  const now = Date.now();

  // Return cached value if still valid
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.prompt;
  }

  // Fetch from database
  const prompt = await getAiPrompt(key);
  if (prompt) {
    promptCache.set(key, { prompt, timestamp: now });
  }

  return prompt;
}
