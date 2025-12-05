import { db } from "@/database/db";
import { article, category } from "@/database/schema";
import { eq, desc, sql, and, ilike } from "drizzle-orm";
import { HeroBanner } from "@/components/article/hero-banner";
import { HeroSection } from "@/components/article/hero-section";
import { ArticleCard } from "@/components/article/article-card";
import { Pagination } from "@/components/article/pagination";
import { CategoryGrid } from "@/components/layout/category-grid";
import { CategoryFilterWrapper } from "@/components/article/category-filter-wrapper";

const HERO_ARTICLES_COUNT = 4;

const ARTICLES_PER_PAGE = 15;

interface HomeProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const selectedCategory = params.category || "all";
  const isFirstPage = currentPage === 1;

  // Get category name for filtering
  let categoryName: string | null = null;
  if (selectedCategory !== "all") {
    const [categoryData] = await db
      .select()
      .from(category)
      .where(eq(category.slug, selectedCategory))
      .limit(1);
    categoryName = categoryData?.name || null;
  }

  // Build WHERE conditions
  const whereConditions = [eq(article.status, "published")];
  if (categoryName) {
    whereConditions.push(ilike(article.categories, `%${categoryName}%`));
  }

  const gridOffset = isFirstPage
    ? HERO_ARTICLES_COUNT
    : HERO_ARTICLES_COUNT + (currentPage - 1) * ARTICLES_PER_PAGE;

  const [heroArticles, gridArticles, totalCountResult] = await Promise.all([
    isFirstPage
      ? db
          .select()
          .from(article)
          .where(and(...whereConditions))
          .orderBy(desc(article.publishedDate))
          .limit(HERO_ARTICLES_COUNT)
      : Promise.resolve([]),
    db
      .select()
      .from(article)
      .where(and(...whereConditions))
      .orderBy(desc(article.publishedDate))
      .limit(ARTICLES_PER_PAGE)
      .offset(gridOffset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(article)
      .where(and(...whereConditions)),
  ]);

  const totalCount = Number(totalCountResult[0]?.count || 0);
  const gridArticlesCount = Math.max(0, totalCount - HERO_ARTICLES_COUNT);
  const totalPages = Math.ceil(gridArticlesCount / ARTICLES_PER_PAGE);

  const hasContent = heroArticles.length > 0 || gridArticles.length > 0;

  return (
    <div className="flex-1">
      <HeroBanner />

      {isFirstPage && heroArticles.length > 0 && (
        <HeroSection articles={heroArticles} />
      )}

      {/* Category Grid - Only on first page */}
      {isFirstPage && <CategoryGrid />}

      {/* Category Filter Tabs */}
      <CategoryFilterWrapper selectedCategory={selectedCategory} />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {!hasContent ? (
          <section className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Ingen artikler fundet
            </p>
          </section>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-8">
              {selectedCategory !== "all" ? `Seneste fra ${categoryName}` : "Seneste Nyt"}
            </h2>

            {gridArticles.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((articleItem) => (
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
            )}

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
