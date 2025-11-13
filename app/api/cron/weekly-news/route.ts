import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fixed prompt for fetching commercial real estate news in Denmark
const NEWS_PROMPT = `Please provide a list of the most important commercial real estate news stories in Denmark from the past week.

Format your response as a markdown list with the following structure for each news item:
- **Title**: [Brief title of the news story]
  - **Summary**: [2-3 sentence summary]
  - **Source**: [Expected source or where this news would typically be found]
  - **Date**: [Approximate date or timeframe]

Provide 5-10 significant news items.`;

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

    // Call OpenAI API with the fixed prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4 with web search capabilities
      messages: [
        {
          role: "system",
          content: "You are a commercial real estate news analyst focused on Denmark. Provide current, accurate news about the Danish commercial real estate market.",
        },
        {
          role: "user",
          content: NEWS_PROMPT,
        },
      ],
      temperature: 0.7,
    });

    const newsListMarkdown = completion.choices[0]?.message?.content;

    if (!newsListMarkdown) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    console.log("Received news list from OpenAI");

    // Parse the markdown list into individual news items
    const newsItems = parseMarkdownNewsList(newsListMarkdown);

    console.log(`Parsed ${newsItems.length} news items`);

    // Send each news item to the article processing endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const processedArticles: Array<{ success: boolean; title: string; id?: string; error?: string }> = [];

    for (const newsItem of newsItems) {
      try {
        console.log(`Processing article: ${newsItem.title}`);

        const response = await fetch(`${baseUrl}/api/articles/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cronSecret}`,
          },
          body: JSON.stringify(newsItem),
        });

        if (!response.ok) {
          const errorData = await response.json();
          processedArticles.push({
            success: false,
            title: newsItem.title,
            error: errorData.error || "Unknown error",
          });
        } else {
          const result = await response.json();
          processedArticles.push({
            success: true,
            title: newsItem.title,
            id: result.articleId,
          });
        }
      } catch (error) {
        console.error(`Error processing article ${newsItem.title}:`, error);
        processedArticles.push({
          success: false,
          title: newsItem.title,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Return summary of processed articles
    return NextResponse.json({
      success: true,
      message: "Weekly news processing completed",
      totalItems: newsItems.length,
      processedArticles,
      rawNewsList: newsListMarkdown,
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

// Helper function to parse markdown news list into structured objects
function parseMarkdownNewsList(markdown: string): Array<{
  title: string;
  summary: string;
  source?: string;
  date?: string;
}> {
  const newsItems: Array<{
    title: string;
    summary: string;
    source?: string;
    date?: string;
  }> = [];

  // Split by list items (lines starting with -)
  const lines = markdown.split("\n");
  let currentItem: { title: string; summary: string; source?: string; date?: string } | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Match title line: - **Title**: [content]
    const titleMatch = trimmedLine.match(/^-\s*\*\*Title\*\*:\s*(.+)$/);
    if (titleMatch) {
      // Save previous item if exists
      if (currentItem && currentItem.title && currentItem.summary) {
        newsItems.push(currentItem);
      }
      // Start new item
      currentItem = {
        title: titleMatch[1].trim(),
        summary: "",
      };
      continue;
    }

    // Match summary line: - **Summary**: [content]
    const summaryMatch = trimmedLine.match(/^-?\s*\*\*Summary\*\*:\s*(.+)$/);
    if (summaryMatch && currentItem) {
      currentItem.summary = summaryMatch[1].trim();
      continue;
    }

    // Match source line: - **Source**: [content]
    const sourceMatch = trimmedLine.match(/^-?\s*\*\*Source\*\*:\s*(.+)$/);
    if (sourceMatch && currentItem) {
      currentItem.source = sourceMatch[1].trim();
      continue;
    }

    // Match date line: - **Date**: [content]
    const dateMatch = trimmedLine.match(/^-?\s*\*\*Date\*\*:\s*(.+)$/);
    if (dateMatch && currentItem) {
      currentItem.date = dateMatch[1].trim();
      continue;
    }
  }

  // Don't forget the last item
  if (currentItem && currentItem.title && currentItem.summary) {
    newsItems.push(currentItem);
  }

  return newsItems;
}
