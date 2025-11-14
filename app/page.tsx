import { db } from "@/database/db";
import { article } from "@/database/schema";
import { eq, desc, sql } from "drizzle-orm";
import { HeroBanner } from "@/components/hero-banner";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";

const ARTICLES_PER_PAGE = 15;

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  // Fetch published articles with pagination
  const [articles, totalCountResult] = await Promise.all([
    db
      .select()
      .from(article)
      .where(eq(article.status, "published"))
      .orderBy(desc(article.publishedDate))
      .limit(ARTICLES_PER_PAGE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(article)
      .where(eq(article.status, "published")),
  ]);

  const totalCount = Number(totalCountResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  return (
    <div className="flex-1">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Articles Section */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {articles.length === 0 ? (
          <section className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Ingen artikler fundet
            </p>
          </section>
        ) : (
          <>
            {/* Section Headline */}
            <h2 className="text-3xl font-bold mb-8">Seneste Nyt</h2>

            {/* Articles Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((articleItem) => (
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

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        )}
      </main>
    </div>
  );
}
