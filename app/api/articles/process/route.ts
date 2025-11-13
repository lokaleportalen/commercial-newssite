import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/database/db";
import { article } from "@/database/schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
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

    // Parse the incoming news item
    const newsItem = await request.json();

    if (!newsItem.title || !newsItem.summary) {
      return NextResponse.json(
        { error: "News item must include title and summary" },
        { status: 400 }
      );
    }

    console.log(`Processing news item: ${newsItem.title}`);

    // Step 1: Research the news story using OpenAI with web search
    const researchPrompt = `Research and gather detailed information about the following commercial real estate news story in Denmark:

Title: ${newsItem.title}
Summary: ${newsItem.summary}
${newsItem.source ? `Source: ${newsItem.source}` : ""}
${newsItem.date ? `Date: ${newsItem.date}` : ""}

Please search the web for additional details, context, and related information about this news story. Provide:
1. Key facts and details
2. Background context
3. Quotes from relevant sources (if available)
4. Impact on the Danish commercial real estate market
5. Related developments or trends

Format your research findings clearly with headings and bullet points.`;

    console.log("Researching news story with OpenAI...");

    const researchCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a commercial real estate journalist researching news stories in Denmark. Provide thorough, accurate research with proper context and details.",
        },
        {
          role: "user",
          content: researchPrompt,
        },
      ],
      temperature: 0.7,
    });

    const researchFindings = researchCompletion.choices[0]?.message?.content;

    if (!researchFindings) {
      return NextResponse.json(
        { error: "Failed to research news story" },
        { status: 500 }
      );
    }

    console.log("Research completed, writing article...");

    // Step 2: Write a structured article based on the research
    const articlePrompt = `Based on the following research, write a comprehensive, professional news article about this Danish commercial real estate story:

Original News Item:
Title: ${newsItem.title}
Summary: ${newsItem.summary}

Research Findings:
${researchFindings}

Write a well-structured article with:
1. An engaging headline (if the original title needs improvement)
2. A compelling lead paragraph
3. Clear body sections with subheadings
4. Quotes and specific details from the research
5. Context about the Danish commercial real estate market
6. Professional, journalistic tone

Format the article in markdown with proper headings (##, ###).`;

    const articleCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional commercial real estate journalist writing articles for a Danish news publication. Write clear, engaging, and informative articles.",
        },
        {
          role: "user",
          content: articlePrompt,
        },
      ],
      temperature: 0.7,
    });

    const articleContent = articleCompletion.choices[0]?.message?.content;

    if (!articleContent) {
      return NextResponse.json(
        { error: "Failed to write article" },
        { status: 500 }
      );
    }

    console.log("Article written, generating metadata...");

    // Step 3: Generate metadata (slug, meta description, summary)
    const metadataPrompt = `Based on this article, generate the following metadata:

Article:
${articleContent}

Provide (in JSON format):
1. slug: URL-friendly slug (lowercase, hyphens, no special chars)
2. metaDescription: SEO meta description (150-160 chars)
3. summary: Brief summary for article preview (2-3 sentences)
4. categories: Comma-separated relevant categories (e.g., "Investment, Office Space, Copenhagen")

Respond ONLY with valid JSON.`;

    const metadataCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an SEO specialist. Generate metadata in valid JSON format only.",
        },
        {
          role: "user",
          content: metadataPrompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const metadataText = metadataCompletion.choices[0]?.message?.content;
    let metadata: {
      slug: string;
      metaDescription: string;
      summary: string;
      categories: string;
    };

    try {
      metadata = JSON.parse(metadataText || "{}");
    } catch (error) {
      console.error("Failed to parse metadata JSON:", error);
      // Fallback metadata
      metadata = {
        slug: newsItem.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        metaDescription: newsItem.summary.substring(0, 160),
        summary: newsItem.summary,
        categories: "Commercial Real Estate",
      };
    }

    console.log("Metadata generated, saving to database...");

    // Step 4: Save the article to the database
    const [insertedArticle] = await db
      .insert(article)
      .values({
        title: newsItem.title,
        slug: metadata.slug,
        content: articleContent,
        summary: metadata.summary,
        metaDescription: metadata.metaDescription,
        sourceUrl: newsItem.source || null,
        categories: metadata.categories,
        status: "published",
        publishedDate: new Date(),
      })
      .returning();

    console.log(`Article saved to database with ID: ${insertedArticle.id}`);

    return NextResponse.json({
      success: true,
      message: "Article processed and saved successfully",
      articleId: insertedArticle.id,
      slug: insertedArticle.slug,
    });

  } catch (error) {
    console.error("Error processing article:", error);
    return NextResponse.json(
      {
        error: "Failed to process article",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
