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
  model?: string; // Optional model override (e.g., "gpt-5-mini", "gemini-3-pro-exp", "claude-haiku-4-5")
}

export interface GenerateTextResponse {
  text: string;
  provider: AIProvider;
}

function getProviderFromModel(model: string): AIProvider {
  if (model.startsWith("gpt-")) return "openai";
  if (model.startsWith("gemini-")) return "gemini";
  if (model.startsWith("claude-")) return "claude";
  return "openai"; // Default fallback
}

export async function generateText(
  options: GenerateTextOptions
): Promise<GenerateTextResponse> {
  const { prompt, useWebSearch = false, maxTokens = 4096, model } = options;

  // If model is provided, use it to determine provider; otherwise use global setting
  const provider = model
    ? getProviderFromModel(model)
    : await getAIProvider();

  switch (provider) {
    case "openai": {
      const openai = getOpenAIClient();
      const openaiModel = model || "gpt-5-mini";

      // OpenAI uses the responses API for web search
      if (useWebSearch) {
        const response = await openai.responses.create({
          model: openaiModel,
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
          model: openaiModel,
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
      const geminiModel = model || "gemini-3-pro-exp";

      // Gemini doesn't have built-in web search, so we use the same model for both
      const response = await genAI.models.generateContent({
        model: geminiModel,
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
      const claudeModel = model || "claude-haiku-4-5";

      // Claude doesn't have built-in web search
      const response = await anthropic.messages.create({
        model: claudeModel,
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

export async function generateJSON<T = unknown>(
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
