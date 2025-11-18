import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/database/db";
import { article, category, articleCategory, image } from "@/database/schema";
import { eq, or, ilike, inArray } from "drizzle-orm";
import { searchUnsplashWithFallback } from "@/lib/unsplash";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        console.log(`Duplicate article found: ${existingArticles[0].title} (ID: ${existingArticles[0].id})`);
        return NextResponse.json({
          success: false,
          message: "Duplicate article detected",
          duplicate: true,
          existingArticleId: existingArticles[0].id,
          existingArticleTitle: existingArticles[0].title,
        }, { status: 200 }); // Return 200 to not break the cron job flow
      }
    }

    // Step 1: Research the news story using OpenAI with web search
    const researchPrompt = `Researche og indsaml detaljeret information om følgende nyhedshistorie fra ejendomsbranchen i Danmark:

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

    console.log("Researching news story with OpenAI...");

    const researchResponse = await openai.responses.create({
      model: "gpt-5-mini",
      tools: [
        { type: "web_search" },
      ],
      input: researchPrompt,
    });

    const researchFindings = researchResponse.output_text;

    if (!researchFindings) {
      return NextResponse.json(
        { error: "Failed to research news story" },
        { status: 500 }
      );
    }

    console.log("Research completed, writing article...");

    // Step 2: Write a structured article based on the research
    const articlePrompt = `Baseret på følgende research, skriv en omfattende, professionel nyhedsartikel på DANSK om denne erhvervsejendomshistorie:

Original nyhed:
Titel: ${newsItem.title}
Resumé: ${newsItem.summary}

Research-resultater:
${researchFindings}

Skriv en velstruktureret artikel med:
1. En engagerende overskrift (# heading) - kun én h1
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

    const articleResponse = await openai.responses.create({
      model: "gpt-5-mini",
      input: articlePrompt,
    });

    const articleContent = articleResponse.output_text;

    if (!articleContent) {
      return NextResponse.json(
        { error: "Failed to write article" },
        { status: 500 }
      );
    }

    console.log("Article written, generating metadata...");

    // Step 3: Generate metadata (slug, meta description, summary, image keywords)
    const metadataPrompt = `Baseret på denne artikel, generer følgende metadata i JSON format:

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
5. imageKeywords: Array med 2-3 søgeord på ENGELSK til billedsøgning (f.eks. ["commercial building", "office interior", "real estate denmark"])

Svar KUN med valid JSON i denne præcise struktur:
{
  "slug": "eksempel-slug",
  "metaDescription": "Beskrivelse her",
  "summary": "Resumé her",
  "categories": "Kategori1, Kategori2",
  "imageKeywords": ["keyword1", "keyword2"]
}`;

    const metadataResponse = await openai.responses.create({
      model: "gpt-5-mini",
      input: metadataPrompt,
    });

    const metadataText = metadataResponse.output_text;
    let metadata: {
      slug: string;
      metaDescription: string;
      summary: string;
      categories: string;
      imageKeywords?: string[];
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
        imageKeywords: ["commercial real estate", "office building"],
      };
    }

    console.log("Metadata generated, searching for image...");

    // Step 4: Search for and save image from Unsplash
    let imageId: string | null = null;

    if (metadata.imageKeywords && metadata.imageKeywords.length > 0) {
      // Try to find an image using the keywords
      const unsplashImage = await searchUnsplashWithFallback(
        metadata.imageKeywords
      );

      if (unsplashImage) {
        console.log(`Found image by ${unsplashImage.photographerName}`);

        // Save image to database
        const [savedImage] = await db
          .insert(image)
          .values({
            url: unsplashImage.url,
            unsplashUrl: unsplashImage.unsplashUrl,
            photographerName: unsplashImage.photographerName,
            photographerUrl: unsplashImage.photographerUrl,
            license: "Unsplash License",
            unsplashId: unsplashImage.id,
            downloadLocation: unsplashImage.downloadLocation,
            description: unsplashImage.description,
          })
          .returning();

        imageId = savedImage.id;
        console.log(`Image saved to database with ID: ${imageId}`);
      } else {
        console.log("No suitable image found on Unsplash");
      }
    }

    console.log("Saving article to database...");

    // Step 5: Save the article to the database
    const [insertedArticle] = await db
      .insert(article)
      .values({
        title: newsItem.title,
        slug: metadata.slug,
        content: articleContent,
        summary: metadata.summary,
        metaDescription: metadata.metaDescription,
        imageId: imageId,
        sourceUrl: newsItem.sourceUrl || null,
        categories: metadata.categories,
        status: "published",
        publishedDate: new Date(),
      })
      .returning();

    console.log(`Article saved to database with ID: ${insertedArticle.id}`);

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

          console.log(`✓ Linked article to ${matchedCategories.length} categories`);
        }
      }
    }

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
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
