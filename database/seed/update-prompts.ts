import { config } from "dotenv";
import { resolve } from "path";
import { db } from "../db";
import { aiPrompt } from "../schema/ai-prompts-schema";
import { eq } from "drizzle-orm";

config({ path: resolve(__dirname, "../../.env") });

async function updatePrompts() {
  console.log("Updating AI prompts to support sources array...\n");

  try {
    // Update news_fetch prompt
    const newsPrompt = `Find 10 nyheder fra ejendomsbranchen i Danmark, eller med relevans for Danmark, som har fået meget omtale den seneste uge - rank med de mest spændende, unikke og aktuelle først. Det skal være relevant for ejere af erhvervsejendomme (målgruppen er udlejere som bruger Lokaleportalen).

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

    await db
      .update(aiPrompt)
      .set({ prompt: newsPrompt })
      .where(eq(aiPrompt.key, "news_fetch"));

    console.log("✓ Updated news_fetch prompt");

    // Update article_research prompt
    const researchPrompt = `Researche og indsaml detaljeret information om følgende nyhedshistorie fra ejendomsbranchen i Danmark:

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

Formatér dine research-resultater tydeligt med overskrifter og punkter.`;

    await db
      .update(aiPrompt)
      .set({ prompt: researchPrompt })
      .where(eq(aiPrompt.key, "article_research"));

    console.log("✓ Updated article_research prompt");

    console.log("\n✓ All AI prompts updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Update failed:", error);
    process.exit(1);
  }
}

updatePrompts();
