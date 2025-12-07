import { schedules, logger, wait } from "@trigger.dev/sdk";
import OpenAI from "openai";
import { processArticle } from "./article-processor";
import { getCachedAiPrompt } from "@/lib/ai-prompts";

// Initialize OpenAI client lazily (fallback for build phase)
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
};

// Fallback prompt for fetching commercial real estate news in Denmark
// This is used if the database prompt is not available
const FALLBACK_NEWS_PROMPT = `Find 10 nyheder fra ejendomsbranchen i Danmark, eller med relevans for Danmark, som har fået meget omtale den seneste uge - rank med de mest spændende, unikke og aktuelle først. Det skal være relevant for ejere af erhvervsejendomme (målgruppen er udlejere som bruger Lokaleportalen).

KRITISK: Du SKAL returnere dit svar som RENT JSON uden nogen ekstra tekst, forklaringer eller kommentarer.

Returner resultaterne i denne EKSAKTE JSON struktur:
{
  "newsItems": [
    {
      "title": "Nyhedstitel",
      "summary": "2-3 sætninger som opsummerer historien",
      "sources": ["URL1", "URL2", "URL3"],
      "date": "Dato eller tidsramme"
    }
  ]
}

VIGTIGT:
- "sources" skal være et array af faktiske URLs hvor du fandt information om nyheden (f.eks. ["https://estatemedia.dk/article/...", "https://edc.dk/artikel/..."]). Inkluder ALLE relevante kilder du brugte.
- Sørg for at returnere præcis 10 nyhedshistorier.
- Dit HELE svar skal være valid JSON - start med { og slut med }
- Inkludér INGEN tekst før eller efter JSON'en
- Skriv IKKE "Her er JSON'en" eller lignende - returner KUN JSON`;

interface NewsItem {
  title: string;
  summary: string;
  sources?: string[];
  date?: string;
}

/**
 * Weekly scheduled task to fetch and process commercial real estate news
 * Runs every Sunday at 6:00 AM Copenhagen time (CET/CEST)
 */
export const weeklyNewsTask = schedules.task({
  id: "weekly-news-fetch",
  // Run every Sunday at 6:00 AM Copenhagen time
  cron: { pattern: "0 6 * * 0", timezone: "Europe/Copenhagen" },
  maxDuration: 3600, // 1 hour max (overrides global config if needed)
  run: async (payload) => {
    logger.info("Starting weekly news fetch", {
      timestamp: payload.timestamp,
      lastRun: payload.lastTimestamp,
    });

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Step 1: Fetch news list from OpenAI
    logger.info("Fetching weekly commercial real estate news from OpenAI...");

    // Get the prompt from database, fallback to hardcoded if not found
    const newsPrompt =
      (await getCachedAiPrompt("news_fetch")) || FALLBACK_NEWS_PROMPT;

    if (newsPrompt === FALLBACK_NEWS_PROMPT) {
      logger.warn(
        "Using fallback news prompt - database prompt not found. Please configure AI prompts in admin panel."
      );
    }

    const openai = getOpenAIClient();
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      tools: [{ type: "web_search" }],
      input: newsPrompt,
    });

    const newsListJson = response.output_text;

    if (!newsListJson) {
      throw new Error("No response from OpenAI");
    }

    logger.info("Received news list from OpenAI");

    // Parse the JSON response into individual news items
    let newsItems: NewsItem[] = [];

    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      let jsonText = newsListJson.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith("```")) {
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1].trim();
        }
      }

      // Try to find JSON object if there's extra text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsedResponse = JSON.parse(jsonText);
      newsItems = parsedResponse.newsItems || [];
    } catch (error) {
      logger.error("Failed to parse news list JSON", {
        error,
        preview: newsListJson.substring(0, 500),
      });
      throw new Error("Failed to parse OpenAI response");
    }

    logger.info(`Parsed ${newsItems.length} news items`);

    // Step 2: Process each news item into a full article
    const processedArticles: Array<{
      success: boolean;
      title: string;
      id?: string;
      error?: string;
      duplicate?: boolean;
    }> = [];

    // Delay between articles to avoid rate limiting (60 seconds)
    const ARTICLE_PROCESSING_DELAY = 60;

    for (let i = 0; i < newsItems.length; i++) {
      const newsItem = newsItems[i];

      logger.info(
        `Processing article ${i + 1}/${newsItems.length}: ${newsItem.title}`
      );

      try {
        const result = await processArticle(newsItem);

        if (result.duplicate) {
          processedArticles.push({
            success: false,
            title: newsItem.title,
            error: "Duplicate article - already exists",
            duplicate: true,
          });
        } else if (result.success) {
          processedArticles.push({
            success: true,
            title: newsItem.title,
            id: result.articleId,
          });
          logger.info(`✓ Article processed successfully: ${result.slug}`);
        } else {
          processedArticles.push({
            success: false,
            title: newsItem.title,
            error: result.error || "Unknown error",
          });
        }
      } catch (error) {
        logger.error(`Error processing article: ${newsItem.title}`, { error });
        processedArticles.push({
          success: false,
          title: newsItem.title,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Add delay between articles (except after the last one)
      // Using wait.for() instead of setTimeout - doesn't count toward compute time!
      if (i < newsItems.length - 1) {
        logger.info(
          `Waiting ${ARTICLE_PROCESSING_DELAY}s before processing next article...`
        );
        await wait.for({ seconds: ARTICLE_PROCESSING_DELAY });
      }
    }

    // Summary
    const successCount = processedArticles.filter((a) => a.success).length;
    const duplicateCount = processedArticles.filter((a) => a.duplicate).length;
    const errorCount = processedArticles.filter(
      (a) => !a.success && !a.duplicate
    ).length;

    logger.info("Weekly news processing completed", {
      total: newsItems.length,
      successful: successCount,
      duplicates: duplicateCount,
      errors: errorCount,
    });

    // Return summary
    return {
      success: true,
      message: "Weekly news processing completed",
      totalItems: newsItems.length,
      successfulArticles: successCount,
      duplicateArticles: duplicateCount,
      errorArticles: errorCount,
      processedArticles,
    };
  },
});
