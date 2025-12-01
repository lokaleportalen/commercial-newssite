import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fixed prompt for fetching commercial real estate news in Denmark
const NEWS_PROMPT = `Find 10 nyheder fra ejendomsbranchen som har fået meget omtale den seneste uge - rank med de mest spændende, unikke og aktuelle først. Det skal være relevant for ejere af erhvervsejendomme (målgruppen er udlejere som bruger Lokaleportalen).

KRITISK: Du SKAL returnere dit svar som RENT JSON uden nogen ekstra tekst, forklaringer eller kommentarer.

Returner resultaterne i denne EKSAKTE JSON struktur:
{
  "newsItems": [
    {
      "title": "Nyhedstitel",
      "summary": "2-3 sætninger som opsummerer historien",
      "sourceUrl": "Den fulde URL til den originale nyhedsartikel (f.eks. https://estatemedia.dk/article/...)",
      "date": "Dato eller tidsramme"
    }
  ]
}

VIGTIGT:
- "sourceUrl" skal være den faktiske URL hvor du fandt nyheden, IKKE bare navnet på kilden. Inkluder altid den fulde URL.
- Sørg for at returnere præcis 10 nyhedshistorier.
- Dit HELE svar skal være valid JSON - start med { og slut med }
- Inkluder INGEN tekst før eller efter JSON'en
- Skriv IKKE "Her er JSON'en" eller lignende - returner KUN JSON`;

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (check for cron secret)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    console.log("Fetching weekly commercial real estate news from OpenAI...");

    // Call OpenAI API with the fixed prompt using web search
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      tools: [
        { type: "web_search" },
      ],
      input: NEWS_PROMPT,
    });

    const newsListJson = response.output_text;

    if (!newsListJson) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    console.log("Received news list from OpenAI");

    // Parse the JSON response into individual news items
    let newsItems: Array<{
      title: string;
      summary: string;
      sourceUrl?: string;
      date?: string;
    }> = [];

    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      let jsonText = newsListJson.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
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
      console.error("Failed to parse news list JSON:", error);
      console.error("Raw response from OpenAI (first 500 chars):", newsListJson.substring(0, 500));
      return NextResponse.json(
        {
          error: "Failed to parse OpenAI response",
          details: error instanceof Error ? error.message : "Unknown error",
          preview: newsListJson.substring(0, 200)
        },
        { status: 500 }
      );
    }

    console.log(`Parsed ${newsItems.length} news items`);

    // Send each news item to the article processing endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const processedArticles: Array<{
      success: boolean;
      title: string;
      id?: string;
      error?: string;
      timeout?: boolean;
    }> = [];

    // Delay between articles to avoid rate limiting (60 seconds)
    const ARTICLE_PROCESSING_DELAY = 60000;

    for (let i = 0; i < newsItems.length; i++) {
      const newsItem = newsItems[i];
      try {
        console.log(`Processing article: ${newsItem.title}`);

        let response;
        let responseText;

        try {
          response = await fetch(`${baseUrl}/api/articles/process`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${cronSecret}`,
            },
            body: JSON.stringify(newsItem),
          });

          // Read response as text first, then try to parse as JSON
          responseText = await response.text();
        } catch (fetchError: any) {
          // Check if it's a timeout error
          const isTimeout = fetchError?.message?.includes("timeout") ||
                          fetchError?.code === "UND_ERR_HEADERS_TIMEOUT" ||
                          fetchError?.code === "ETIMEDOUT";

          if (isTimeout) {
            // Timeout - but the article processing continues in the background
            console.log(`⏰ Connection timeout for article "${newsItem.title}" - processing continues in background`);
            processedArticles.push({
              success: true, // Mark as success since processing continues
              title: newsItem.title,
              id: "unknown", // We don't have the ID due to timeout
              timeout: true,
            });
            continue; // Skip to next article
          } else {
            // Some other error - re-throw
            throw fetchError;
          }
        }

        if (!response.ok) {
          let errorMessage = "Unknown error";
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || "Unknown error";
          } catch (parseError) {
            // Response is not JSON (likely HTML error page)
            errorMessage = `Server error (${response.status}): ${responseText.substring(0, 200)}`;
          }
          processedArticles.push({
            success: false,
            title: newsItem.title,
            error: errorMessage,
          });
        } else {
          try {
            const result = JSON.parse(responseText);

            // Handle duplicate articles (success: false but 200 status)
            if (result.duplicate) {
              processedArticles.push({
                success: false,
                title: newsItem.title,
                error: "Duplicate article - already exists",
              });
            } else {
              processedArticles.push({
                success: true,
                title: newsItem.title,
                id: result.articleId,
              });
            }
          } catch (parseError) {
            processedArticles.push({
              success: false,
              title: newsItem.title,
              error: `Invalid JSON response: ${responseText.substring(0, 200)}`,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing article ${newsItem.title}:`, error);
        processedArticles.push({
          success: false,
          title: newsItem.title,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Add delay between articles (except after the last one)
      if (i < newsItems.length - 1) {
        console.log(`Waiting ${ARTICLE_PROCESSING_DELAY/1000}s before processing next article...`);
        await new Promise(resolve => setTimeout(resolve, ARTICLE_PROCESSING_DELAY));
      }
    }

    // Return summary of processed articles
    return NextResponse.json({
      success: true,
      message: "Weekly news processing completed",
      totalItems: newsItems.length,
      processedArticles,
      rawNewsList: newsListJson,
    });

  } catch (error) {
    console.error("Error in weekly news cron job:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch or process news",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
