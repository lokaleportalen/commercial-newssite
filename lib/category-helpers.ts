import { db } from "@/database/db";
import { category, articleCategory } from "@/database/schema";
import { eq, inArray } from "drizzle-orm";

// Type definitions
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroImage?: string | null;
}

export interface ArticleWithCategories {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  metaDescription: string | null;
  image: string | null;
  sourceUrl: string | null;
  status: string;
  publishedDate: Date;
  createdAt: Date;
  updatedAt: Date;
  promptId: string | null;
  categories: Category[];
}

/**
 * Resolve category input (names or IDs) to category IDs
 * @param input Array of category names (e.g., ["Investering", "Byggeri"]) or UUIDs
 * @returns Object with validated IDs and any unknown category names
 */
export async function resolveCategoryIds(
  input: string[]
): Promise<{ ids: string[]; unknown: string[] }> {
  if (input.length === 0) return { ids: [], unknown: [] };

  // Check if first item looks like UUID (simplified check)
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      input[0]
    );

  if (isUuid) {
    // Already IDs, validate they exist
    const found = await db
      .select({ id: category.id })
      .from(category)
      .where(inArray(category.id, input));

    const foundIds = found.map((c) => c.id);
    const unknown = input.filter((id) => !foundIds.includes(id));

    return { ids: foundIds, unknown };
  } else {
    // Names, look up IDs (case-insensitive)
    const found = await db
      .select({ id: category.id, name: category.name })
      .from(category);

    const nameToId = new Map(
      found.map((c) => [c.name.toLowerCase(), c.id])
    );

    const ids: string[] = [];
    const unknown: string[] = [];

    for (const name of input) {
      const id = nameToId.get(name.toLowerCase());
      if (id) {
        ids.push(id);
      } else {
        unknown.push(name);
      }
    }

    return { ids, unknown };
  }
}

/**
 * Update article categories (replace all existing categories)
 * @param articleId Article ID
 * @param categoryIds Array of category IDs
 */
export async function updateArticleCategories(
  articleId: string,
  categoryIds: string[]
): Promise<void> {
  // Delete existing categories
  await db
    .delete(articleCategory)
    .where(eq(articleCategory.articleId, articleId));

  // Insert new categories
  if (categoryIds.length > 0) {
    await db.insert(articleCategory).values(
      categoryIds.map((categoryId) => ({
        articleId,
        categoryId,
      }))
    );
  }
}

/**
 * Get categories for a single article
 * @param articleId Article ID
 * @returns Array of categories
 */
export async function getArticleCategories(
  articleId: string
): Promise<Category[]> {
  const results = await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
    })
    .from(articleCategory)
    .innerJoin(category, eq(articleCategory.categoryId, category.id))
    .where(eq(articleCategory.articleId, articleId));

  return results;
}

/**
 * Get categories for multiple articles (avoid N+1 queries)
 * @param articleIds Array of article IDs
 * @returns Map of article ID to categories array
 */
export async function getArticleCategoriesBulk(
  articleIds: string[]
): Promise<Map<string, Category[]>> {
  if (articleIds.length === 0) {
    return new Map();
  }

  const results = await db
    .select({
      articleId: articleCategory.articleId,
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
    })
    .from(articleCategory)
    .innerJoin(category, eq(articleCategory.categoryId, category.id))
    .where(inArray(articleCategory.articleId, articleIds));

  // Group categories by article ID
  const categoryMap = new Map<string, Category[]>();

  for (const row of results) {
    if (!categoryMap.has(row.articleId)) {
      categoryMap.set(row.articleId, []);
    }
    categoryMap.get(row.articleId)!.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
    });
  }

  return categoryMap;
}

/**
 * Get category hero image URL
 * Returns the hero image URL from database or null if not set
 * @param slug Category slug (kept for backwards compatibility but not used)
 * @param heroImage Hero image URL from database
 * @returns Image URL or null if no image available
 */
export function getCategoryHeroImage(
  slug: string,
  heroImage?: string | null
): string | null {
  // Return the hero image URL from database if set
  // No fallback to public folder - images must be uploaded to Vercel Blob
  return heroImage || null;
}
