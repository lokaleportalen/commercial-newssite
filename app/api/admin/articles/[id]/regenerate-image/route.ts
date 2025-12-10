import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { article } from "@/database/schema";
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { getAiPromptWithVars } from "@/lib/ai-prompts";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Initialize Gemini client lazily
const getGeminiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });
};

/**
 * POST /api/admin/articles/[id]/regenerate-image
 * Generate a new image for an article using Gemini
 * Body: { customDescription?: string }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();
    const { customDescription } = body;

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Image generation not configured - GEMINI_API_KEY missing" },
        { status: 503 }
      );
    }

    // Fetch the article
    const articles = await db
      .select()
      .from(article)
      .where(eq(article.id, id))
      .limit(1);

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const currentArticle = articles[0];

    console.log(
      `Generating new image for article: ${currentArticle.title} (ID: ${id})`
    );

    // Get base image generation prompt from database
    const basePrompt = await getAiPromptWithVars("image_generation", {
      title: currentArticle.title,
    });

    // Build final prompt - combine base prompt with custom description if provided
    let finalPrompt: string;
    if (customDescription && customDescription.trim().length > 0) {
      // If we have a base prompt from DB, append custom description
      if (basePrompt) {
        finalPrompt = `${basePrompt}\n\nAdditional instructions: ${customDescription.trim()}`;
      } else {
        // Fallback: use custom description with default base prompt
        finalPrompt = `You are an award winning professional journalistic photographer. Your photos are realistic, proper photographies of the news story. Make a hero image in landscape mode with no text, for an article in a digital newspaper about commercial real estate, specifically related to the article with the headline: ${currentArticle.title}\n\nAdditional instructions: ${customDescription.trim()}`;
      }
    } else {
      // No custom description - use base prompt or fallback
      finalPrompt =
        basePrompt ||
        `You are an award winning professional journalistic photographer. Your photos are realistic, proper photographies of the news story. Make a hero image in landscape mode with no text, for an article in a digital newspaper about commercial real estate, specifically related to the article with the headline: ${currentArticle.title}`;
    }

    console.log("Generating image with Gemini 3 Pro Image Preview...");
    if (customDescription) {
      console.log(`Custom description provided: ${customDescription}`);
    }

    const genAI = getGeminiClient();

    let response;
    let retryCount = 0;
    const maxRetries = 3;

    // Retry logic for rate limits, timeouts, and network errors
    while (retryCount < maxRetries) {
      try {
        response = await genAI.models.generateContent({
          model: "gemini-3-pro-image-preview",
          contents: finalPrompt,
        });
        break; // Success, exit retry loop
      } catch (error: unknown) {
        const isLastRetry = retryCount >= maxRetries - 1;

        // Type guard for error object
        const err = error as {
          status?: number;
          error?: {
            code?: number;
            details?: Array<{ "@type"?: string; retryDelay?: string }>;
          };
          message?: string;
          code?: string;
        };

        // Check error type
        const isRateLimit = err?.status === 429;
        const isServiceUnavailable =
          err?.status === 503 ||
          err?.error?.code === 503 ||
          err?.message?.includes("overloaded");
        const isTimeout =
          err?.message?.includes("fetch failed") ||
          err?.message?.includes("timeout") ||
          err?.code === "ETIMEDOUT" ||
          err?.code === "ECONNRESET";
        const isNetworkError =
          err?.message?.includes("network") ||
          err?.code === "ECONNREFUSED" ||
          err?.code === "ENOTFOUND";

        // Retry on rate limits, service unavailable, timeouts, or network errors
        if (
          (isRateLimit ||
            isServiceUnavailable ||
            isTimeout ||
            isNetworkError) &&
          !isLastRetry
        ) {
          let delayMs;
          let reason;

          if (isRateLimit) {
            // Rate limit - use API's suggested delay or default 60s
            const retryDelay = err?.error?.details?.find(
              (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
            )?.retryDelay;
            delayMs = retryDelay ? parseInt(retryDelay) * 1000 : 60000;
            reason = "Rate limit";
          } else if (isServiceUnavailable) {
            // Service overloaded - exponential backoff: 45s, 90s, 180s
            delayMs = 45000 * Math.pow(2, retryCount);
            reason = "Service overloaded";
          } else if (isTimeout) {
            // Timeout - exponential backoff: 30s, 60s, 120s
            delayMs = 30000 * Math.pow(2, retryCount);
            reason = "Timeout";
          } else {
            // Network error - shorter delay: 10s, 20s, 40s
            delayMs = 10000 * Math.pow(2, retryCount);
            reason = "Network error";
          }

          console.warn(
            `${reason} during image generation, retrying in ${
              delayMs / 1000
            }s... (attempt ${retryCount + 1}/${maxRetries})`
          );

          await new Promise((resolve) => setTimeout(resolve, delayMs));
          retryCount++;
        } else {
          // Not retryable or max retries reached
          throw error;
        }
      }
    }

    if (!response) {
      throw new Error("Failed to generate image after retries");
    }

    // Extract the generated image data from response parts
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      throw new Error("No image parts returned from Gemini");
    }

    let imageUrl: string | null = null;

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        console.log("Image generated successfully, uploading to Vercel Blob...");

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(part.inlineData.data, "base64");

        // Generate unique filename with timestamp
        const filename = `article-${id}-${Date.now()}.png`;

        // Upload to Vercel Blob
        const blob = await put(filename, imageBuffer, {
          access: "public",
          contentType: "image/png",
        });

        imageUrl = blob.url;

        console.log(`✓ New image uploaded: ${imageUrl}`);
        break; // Only process the first image
      }
    }

    if (!imageUrl) {
      throw new Error("No image data returned from Gemini");
    }

    // Return the new image URL WITHOUT updating the article
    // The admin will choose between old and new in the UI
    return NextResponse.json(
      {
        newImageUrl: imageUrl,
        message: "Image generated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error regenerating image:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
