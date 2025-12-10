import { db } from "../db";
import { aiPrompt } from "../schema/ai-prompts-schema";

export async function seedAiPrompts() {
  console.log("Seeding AI prompts...");

  const prompts = [
    {
      key: "news_fetch",
      name: "Daily News Fetch",
      description:
        "Fetches commercial real estate news items from Denmark with high relevance for property owners",
      model: "gpt-5-nano",
      section: "Daily News",
      prompt: `Find 10 nyheder fra ejendomsbranchen i Danmark, eller med relevans for Danmark, som har fået meget omtale den seneste uge - rank med de mest spændende, unikke og aktuelle først. Det skal være relevant for ejere af erhvervsejendomme (målgruppen er udlejere som bruger Lokaleportalen).

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
- Skriv IKKE "Her er JSON'en" eller lignende - returner KUN JSON`,
    },
    {
      key: "article_research",
      name: "Article Research",
      description:
        "Researches a news story using web search to gather detailed information",
      model: "gpt-5-mini",
      section: "Article Generation",
      prompt: `Researche og indsaml detaljeret information om følgende nyhedshistorie fra ejendomsbranchen i Danmark:

Titel: {{title}}
Resumé: {{summary}}
{{#if sources}}Kilder:
{{sources}}{{/if}}
{{#if date}}Dato: {{date}}{{/if}}

Søg på nettet efter yderligere detaljer, kontekst og relateret information om denne nyhedshistorie. Levér:
1. Nøglefakta og detaljer
2. Baggrundskontekst
3. Citater fra relevante kilder (hvis tilgængelige)
4. Indvirkning på det danske erhvervsejendomsmarked
5. Relaterede udviklinger eller tendenser

KRITISK: Under din research, hold styr på ALLE de URLs du bruger som kilder. Returner dem i dit research svar under en "Kilder brugt:" sektion.

Formatér dine research-resultater tydeligt med overskrifter og punkter.`,
    },
    {
      key: "article_writing",
      name: "Article Writing",
      description:
        "Writes a comprehensive, professional news article based on research findings",
      model: "gpt-5-mini",
      section: "Article Generation",
      prompt: `Du er en prisvindende dansk journalist. Baseret på følgende research, skriv en omfattende, professionel nyhedsartikel på DANSK om denne erhvervsejendomshistorie:

Original nyhed:
Titel: {{title}}
Resumé: {{summary}}

Research-resultater:
{{researchFindings}}

Skriv en velstruktureret artikel med:
1. Start med et overbevisende indledende afsnit (IKKE en overskrift - titlen vises allerede øverst på siden)
2. Klare brødtekst-sektioner med 2-3 underoverskrifter (## heading) - maksimalt 3
3. Brug kun ### overskrifter hvis det er absolut nødvendigt
4. Citater og specifikke detaljer fra research
5. Kontekst om det danske erhvervsejendomsmarked
6. Professionel, journalistisk tone

VIGTIGT:
- Artiklen skal være på DANSK
- Start IKKE artiklen med en # overskrift (h1) - siden har allerede en titel
- Brug kun ## (h2) eller ### (h3) overskrifter i artikelteksten
- Inkludér IKKE "Kilde:" eller kildehenvisninger i bunden af artiklen
- Returner KUN artikelindholdet i markdown format
- Inkludér IKKE opfølgende spørgsmål eller meta-kommentarer
- Artiklen skal slutte med det faktiske indhold, ikke med spørgsmål til læseren

Formatér artiklen i markdown med korrekte overskrifter (##, ###).`,
    },
    {
      key: "article_metadata",
      name: "Article Metadata Generation",
      description:
        "Generates SEO-friendly metadata including slug, meta description, summary, and categories",
      model: "gpt-5-mini",
      section: "Article Generation",
      prompt: `Baseret på denne artikel, generer følgende metadata i JSON format:

Artikel:
{{articleContent}}

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
}`,
    },
    {
      key: "image_generation",
      name: "Hero Image Generation",
      description:
        "Generates a realistic hero image for article using professional photography style",
      model: "gemini-3-pro-image-preview",
      section: "Image Generation",
      prompt: `You are an award wining professional journalistic photographer. Your photos are realistic, proper photographies of the news story. Make a hero image in landscape mode with no text, for an article in a digital newspaper about commercial real estate, specifically related to the article with the headline: {{title}}`,
    },
  ];

  await db.insert(aiPrompt).values(prompts);

  console.log(`✓ Created ${prompts.length} AI prompts`);
}
