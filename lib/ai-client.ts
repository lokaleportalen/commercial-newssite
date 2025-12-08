import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/database/db";
import { systemSettings, type AIProvider } from "@/database/schema";
import { eq } from "drizzle-orm";

// Initialize clients lazily
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
};

const getGeminiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });
};

const getClaudeClient = () => {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });
};

/**
 * Get the currently configured AI provider from database
 */
export async function getAIProvider(): Promise<AIProvider> {
  try {
    const settings = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "ai_provider"))
      .limit(1);

    if (settings && settings.length > 0) {
      const provider = settings[0].value as AIProvider;
      // Validate provider
      if (["openai", "gemini", "claude"].includes(provider)) {
        return provider;
      }
    }

    // Default to openai
    return "openai";
  } catch (error) {
    console.error("Error fetching AI provider setting:", error);
    return "openai"; // Fallback default
  }
}

/**
 * Update the AI provider setting in database
 */
export async function setAIProvider(provider: AIProvider): Promise<void> {
  await db
    .update(systemSettings)
    .set({ value: provider, updatedAt: new Date() })
    .where(eq(systemSettings.key, "ai_provider"));
}

export interface GenerateTextOptions {
  prompt: string;
  useWebSearch?: boolean;
  maxTokens?: number;
}

export interface GenerateTextResponse {
  text: string;
  provider: AIProvider;
}

/**
 * Generate text using the configured AI provider
 * Provides a unified interface for OpenAI, Gemini, and Claude
 */
export async function generateText(
  options: GenerateTextOptions
): Promise<GenerateTextResponse> {
  const provider = await getAIProvider();
  const { prompt, useWebSearch = false, maxTokens = 4096 } = options;

  switch (provider) {
    case "openai": {
      const openai = getOpenAIClient();

      // OpenAI uses the responses API for web search
      if (useWebSearch) {
        const response = await openai.responses.create({
          model: "gpt-5-mini",
          tools: [{ type: "web_search" }],
          input: prompt,
        });

        return {
          text: response.output_text || "",
          provider: "openai",
        };
      } else {
        // Regular chat completion
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
        });

        return {
          text: response.choices[0]?.message?.content || "",
          provider: "openai",
        };
      }
    }

    case "gemini": {
      const genAI = getGeminiClient();

      // Gemini doesn't have built-in web search, so we use the same model for both
      const response = await genAI.models.generateContent({
        model: "gemini-3-pro-exp",
        contents: prompt,
      });

      const text = response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("\n") || "";

      return {
        text,
        provider: "gemini",
      };
    }

    case "claude": {
      const anthropic = getClaudeClient();

      // Claude doesn't have built-in web search
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.type === "text" ? block.text : "")
        .join("\n");

      return {
        text,
        provider: "claude",
      };
    }

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Generate text with JSON response format
 * Attempts to extract valid JSON from the response
 */
export async function generateJSON<T = any>(
  options: GenerateTextOptions
): Promise<{ data: T; provider: AIProvider }> {
  const response = await generateText(options);

  try {
    // Try to parse the entire response as JSON
    const data = JSON.parse(response.text);
    return { data, provider: response.provider };
  } catch {
    // If that fails, try to extract JSON from the text (common with markdown code blocks)
    const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      return { data, provider: response.provider };
    }

    // Try to find JSON between curly braces
    const jsonObjectMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      const data = JSON.parse(jsonObjectMatch[0]);
      return { data, provider: response.provider };
    }

    throw new Error("Failed to parse JSON from response");
  }
}
