import { db } from "@/database/db";
import { article } from "@/database/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";
import { ArticleCard } from "@/components/article/article-card";
import { Pagination } from "@/components/article/pagination";
import { getArticleCategoriesBulk } from "@/lib/category-helpers";
import { CategoryFilterWrapper } from "@/components/article/category-filter-wrapper";
import { SortOption } from "@/components/article/article-sort";
import { Metadata } from "next";

const ARTICLES_PER_PAGE = 20;

export const metadata: Metadata = {
  title: "Alle Nyheder | Estate News",
  description:
    "Gennemse alle artikler om erhvervsejendomme i Danmark. Filtrer efter kategori og sorter efter dato eller titel.",
};

interface NyhederProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function NyhederPage({ searchParams }: NyhederProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const selectedCategory = params.category || "all";
  const selectedSort = params.sort || "newest";

  // Build WHERE conditions
  const whereConditions = [eq(article.status, "published")];

  // Determine sort order
  let orderByClause;
  switch (selectedSort) {
    case "oldest":
      orderByClause = asc(article.publishedDate);
      break;
    case "title-asc":
      orderByClause = asc(article.title);
      break;
    case "title-desc":
      orderByClause = desc(article.title);
      break;
    case "newest":
    default:
      orderByClause = desc(article.publishedDate);
      break;
  }

  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  const [articles, totalCountResult] = await Promise.all([
    db
      .select()
      .from(article)
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(ARTICLES_PER_PAGE * 2) // Fetch more to account for category filtering
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(article)
      .where(and(...whereConditions)),
  ]);

  // Fetch categories for all articles
  const articleIds = articles.map((a) => a.id);
  const categoriesMap = await getArticleCategoriesBulk(articleIds);

  // Merge categories into articles
  let articlesWithCategories = articles.map((art) => ({
    ...art,
    categories: categoriesMap.get(art.id) || [],
  }));

  // Filter by category if selected
  if (selectedCategory !== "all") {
    articlesWithCategories = articlesWithCategories.filter((art) =>
      art.categories.some((cat) => cat.slug === selectedCategory)
    );
  }

  // Limit to page size after filtering
  articlesWithCategories = articlesWithCategories.slice(0, ARTICLES_PER_PAGE);

  const totalCount = Number(totalCountResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">Alle Nyheder</h1>
          <p className="text-muted-foreground">
            Gennemse alle artikler om erhvervsejendomme i Danmark
          </p>
        </div>
      </header>

      <CategoryFilterWrapper
        selectedCategory={selectedCategory}
        currentSort={selectedSort as SortOption}
        basePath="/nyheder"
      />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Results Count */}
        <header className="mb-6">
          <p className="text-muted-foreground">
            {articlesWithCategories.length} af {totalCount}{" "}
            {totalCount === 1 ? "artikel" : "artikler"}
            {selectedCategory !== "all" && " i denne kategori"}
          </p>
        </header>

        {/* Articles Grid */}
        {articlesWithCategories.length > 0 ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articlesWithCategories.map((articleItem) => (
                <ArticleCard
                  key={articleItem.id}
                  title={articleItem.title}
                  slug={articleItem.slug}
                  summary={articleItem.summary}
                  image={articleItem.image}
                  publishedDate={articleItem.publishedDate}
                  categories={articleItem.categories}
                />
              ))}
            </section>

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        ) : (
          <article className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Ingen artikler fundet
              {selectedCategory !== "all" && " i denne kategori"}
            </p>
          </article>
        )}
      </main>
    </div>
  );
}
