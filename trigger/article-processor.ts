import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { db } from "@/database/db";
import { article, category, articleCategory } from "@/database/schema";
import { eq, or, ilike, inArray } from "drizzle-orm";
import { logger } from "@trigger.dev/sdk";
import { getCachedAiPrompt, getAiPromptWithVars } from "@/lib/ai-prompts";

// Initialize OpenAI client lazily (fallback for build phase)
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
};

// Initialize Gemini client lazily (fallback for build phase)
const getGeminiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });
};

interface NewsItem {
  title: string;
  summary: string;
  sourceUrl?: string;
  date?: string;
}

interface ProcessArticleResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  imageUrl?: string | null;
  error?: string;
  duplicate?: boolean;
}

/**
 * Process a single news item into a full article with AI-generated content and image
 */
export async function processArticle(
  newsItem: NewsItem
): Promise<ProcessArticleResult> {
  try {
    if (!newsItem.title || !newsItem.summary) {
      throw new Error("News item must include title and summary");
    }

    logger.info(`Processing news item: ${newsItem.title}`);

    // Check for duplicate articles before processing
    const duplicateConditions = [];

    // Check by sourceUrl if provided
    if (newsItem.sourceUrl) {
      duplicateConditions.push(eq(article.sourceUrl, newsItem.sourceUrl));
    }

    // Check by similar title (case-insensitive)
    duplicateConditions.push(ilike(article.title, newsItem.title));

    if (duplicateConditions.length > 0) {
      const existingArticles = await db
        .select()
        .from(article)
        .where(or(...duplicateConditions))
        .limit(1);

      if (existingArticles.length > 0) {
        logger.warn(
          `Duplicate article found: ${existingArticles[0].title} (ID: ${existingArticles[0].id})`
        );
        return {
          success: false,
          duplicate: true,
          error: "Duplicate article - already exists",
        };
      }
    }

    // Step 1: Research the news story using OpenAI with web search
    logger.info("Researching news story with OpenAI...");

    // Get research prompt from database
    const researchPrompt = await getAiPromptWithVars("article_research", {
      title: newsItem.title,
      summary: newsItem.summary,
      sourceUrl: newsItem.sourceUrl || "",
      date: newsItem.date || "",
    });

    // Fallback if database prompt not found
    const finalResearchPrompt =
      researchPrompt ||
      `Researche og indsaml detaljeret information om følgende nyhedshistorie fra ejendomsbranchen i Danmark:

Titel: ${newsItem.title}
Resumé: ${newsItem.summary}
${newsItem.sourceUrl ? `Kilde URL: ${newsItem.sourceUrl}` : ""}
${newsItem.date ? `Dato: ${newsItem.date}` : ""}

Søg på nettet efter yderligere detaljer, kontekst og relateret information om denne nyhedshistorie. Levér:
1. Nøglefakta og detaljer
2. Baggrundskontekst
3. Citater fra relevante kilder (hvis tilgængelige)
4. Indvirkning på det danske erhvervsejendomsmarked
5. Relaterede udviklinger eller tendenser

Formatér dine research-resultater tydeligt med overskrifter og punkter.`;

    if (!researchPrompt) {
      logger.warn(
        "Using fallback research prompt - database prompt not found"
      );
    }

    const openai = getOpenAIClient();
    const researchResponse = await openai.responses.create({
      model: "gpt-5-mini",
      tools: [{ type: "web_search" }],
      input: finalResearchPrompt,
    });

    const researchFindings = researchResponse.output_text;

    if (!researchFindings) {
      throw new Error("Failed to research news story");
    }

    logger.info("Research completed, writing article...");

    // Step 2: Write a structured article based on the research
    // Get article writing prompt from database
    const articlePrompt = await getAiPromptWithVars("article_writing", {
      title: newsItem.title,
      summary: newsItem.summary,
      researchFindings: researchFindings,
    });

    // Fallback if database prompt not found
    const finalArticlePrompt =
      articlePrompt ||
      `Du er en prisvindende dansk journalist. Baseret på følgende research, skriv en omfattende, professionel nyhedsartikel på DANSK om denne erhvervsejendomshistorie:

Original nyhed:
Titel: ${newsItem.title}
Resumé: ${newsItem.summary}

Research-resultater:
${researchFindings}

Skriv en velstruktureret artikel med:
1. En engagerende overskrift (# heading) - kun én h1. Du skal finde på din egen, og ikke kopiere en eksisterende.
2. Et overbevisende indledende afsnit
3. Klare brødtekst-sektioner med 2-3 underoverskrifter (## heading) - maksimalt 3
4. Brug kun ### overskrifter hvis det er absolut nødvendigt
5. Citater og specifikke detaljer fra research
6. Kontekst om det danske erhvervsejendomsmarked
7. Professionel, journalistisk tone

VIGTIGT:
- Artiklen skal være på DANSK
- Inkludér IKKE "Kilde:" eller kildehenvisninger i bunden af artiklen
- Returner KUN artikelindholdet i markdown format
- Inkludér IKKE opfølgende spørgsmål eller meta-kommentarer
- Artiklen skal slutte med det faktiske indhold, ikke med spørgsmål til læseren

Formatér artiklen i markdown med korrekte overskrifter (#, ##, ###).`;

    if (!articlePrompt) {
      logger.warn(
        "Using fallback article writing prompt - database prompt not found"
      );
    }

    const articleResponse = await openai.responses.create({
      model: "gpt-5-mini",
      input: finalArticlePrompt,
    });

    const articleContent = articleResponse.output_text;

    if (!articleContent) {
      throw new Error("Failed to write article");
    }

    logger.info("Article written, generating metadata...");

    // Step 3: Generate metadata (slug, meta description, summary)
    // Get metadata prompt from database
    const metadataPrompt = await getAiPromptWithVars("article_metadata", {
      articleContent: articleContent,
    });

    // Fallback if database prompt not found
    const finalMetadataPrompt =
      metadataPrompt ||
      `Baseret på denne artikel, generer følgende metadata i JSON format:

Artikel:
${articleContent}

Levér:
1. slug: URL-venlig slug (små bogstaver, bindestreger, ingen specialtegn)
2. metaDescription: SEO meta beskrivelse på DANSK (150-160 tegn)
3. summary: Kort resumé til artikelforhåndsvisning på DANSK (2-3 sætninger)
4. categories: Kommaseparerede relevante kategorier på DANSK. Vælg KUN fra disse kategorier:
   - Investering
   - Byggeri
   - Kontor
   - Lager
   - Detailhandel
   - Logistik
   - Hotel
   - Industri
   - Bolig
   - Bæredygtighed

Svar KUN med valid JSON i denne præcise struktur:
{
  "slug": "eksempel-slug",
  "metaDescription": "Beskrivelse her",
  "summary": "Resumé her",
  "categories": "Kategori1, Kategori2"
}`;

    if (!metadataPrompt) {
      logger.warn(
        "Using fallback metadata prompt - database prompt not found"
      );
    }

    const metadataResponse = await openai.responses.create({
      model: "gpt-5-mini",
      input: finalMetadataPrompt,
    });

    const metadataText = metadataResponse.output_text;
    let metadata: {
      slug: string;
      metaDescription: string;
      summary: string;
      categories: string;
    };

    try {
      metadata = JSON.parse(metadataText || "{}");
    } catch (error) {
      logger.warn("Failed to parse metadata JSON, using fallback", { error });
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

    logger.info("Metadata generated, saving to database...");

    // Step 4: Save the article to the database
    const [insertedArticle] = await db
      .insert(article)
      .values({
        title: newsItem.title,
        slug: metadata.slug,
        content: articleContent,
        summary: metadata.summary,
        metaDescription: metadata.metaDescription,
        sourceUrl: newsItem.sourceUrl || null,
        categories: metadata.categories,
        status: "published",
        publishedDate: new Date(),
      })
      .returning();

    logger.info(`Article saved to database with ID: ${insertedArticle.id}`);

    // Step 5: Link article to categories using the junction table
    if (metadata.categories) {
      // Parse categories from comma-separated string
      const categoryNames = metadata.categories
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      if (categoryNames.length > 0) {
        // Look up category IDs by name
        const matchedCategories = await db
          .select()
          .from(category)
          .where(inArray(category.name, categoryNames));

        if (matchedCategories.length > 0) {
          // Insert into junction table
          const articleCategoryValues = matchedCategories.map((cat) => ({
            articleId: insertedArticle.id,
            categoryId: cat.id,
          }));

          await db.insert(articleCategory).values(articleCategoryValues);

          logger.info(
            `✓ Linked article to ${matchedCategories.length} categories`
          );
        }
      }
    }

    // Step 6: Generate hero image using Gemini 3 Pro Image Preview
    let imageUrl: string | null = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        logger.info("Generating hero image with Gemini 3 Pro Image Preview...");

        const genAI = getGeminiClient();

        // Get image generation prompt from database
        const imagePrompt = await getAiPromptWithVars("image_generation", {
          title: newsItem.title,
        });

        // Fallback if database prompt not found
        const finalImagePrompt =
          imagePrompt ||
          `You are an award wining professional journalistic photographer. Your photos are realistic, proper photographies of the news story. Make a hero image in landscape mode with no text, for an article in a digital newspaper about commercial real estate, specifically related to the article with the headline: ${newsItem.title}`;

        if (!imagePrompt) {
          logger.warn(
            "Using fallback image prompt - database prompt not found"
          );
        }

        let response;
        let retryCount = 0;
        const maxRetries = 3;

        // Retry logic for rate limits, timeouts, and network errors
        while (retryCount < maxRetries) {
          try {
            response = await genAI.models.generateContent({
              model: "gemini-3-pro-image-preview",
              contents: finalImagePrompt,
            });
            break; // Success, exit retry loop
          } catch (error: any) {
            const isLastRetry = retryCount >= maxRetries - 1;

            // Check error type
            const isRateLimit = error?.status === 429;
            const isServiceUnavailable =
              error?.status === 503 ||
              error?.error?.code === 503 ||
              error?.message?.includes("overloaded");
            const isTimeout =
              error?.message?.includes("fetch failed") ||
              error?.message?.includes("timeout") ||
              error?.code === "ETIMEDOUT" ||
              error?.code === "ECONNRESET";
            const isNetworkError =
              error?.message?.includes("network") ||
              error?.code === "ECONNREFUSED" ||
              error?.code === "ENOTFOUND";

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
                const retryDelay = error?.error?.details?.find(
                  (d: any) =>
                    d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
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

              logger.warn(
                `${reason} during image generation, retrying in ${
                  delayMs / 1000
                }s... (attempt ${retryCount + 1}/${maxRetries})`
              );
              logger.debug(`Error details: ${error?.message || error}`);

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

        // Get the generated image data from response parts
        const parts = response.candidates?.[0]?.content?.parts;

        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              logger.info(
                "Image generated successfully, uploading to Vercel Blob..."
              );

              // Convert base64 to buffer
              const imageBuffer = Buffer.from(part.inlineData.data, "base64");

              // Generate unique filename
              const filename = `article-${
                insertedArticle.id
              }-${Date.now()}.png`;

              // Upload to Vercel Blob
              const blob = await put(filename, imageBuffer, {
                access: "public",
                contentType: "image/png",
              });

              imageUrl = blob.url;

              // Update article with image URL
              await db
                .update(article)
                .set({ image: imageUrl })
                .where(eq(article.id, insertedArticle.id));

              logger.info(`✓ Image uploaded and article updated: ${imageUrl}`);
              break; // Only process the first image
            }
          }
        }

        if (!imageUrl) {
          logger.warn("No image data returned from Gemini");
        }
      } catch (error) {
        logger.error("Error generating or uploading image", { error });
      }
    } else {
      logger.info("Skipping image generation - GEMINI_API_KEY not configured");
    }

    return {
      success: true,
      articleId: insertedArticle.id,
      slug: insertedArticle.slug,
      imageUrl: imageUrl,
    };
  } catch (error) {
    logger.error("Error processing article", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
