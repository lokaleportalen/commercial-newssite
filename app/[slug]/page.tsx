import { db } from "@/database/db";
import { article, category } from "@/database/schema";
import { eq, desc, sql, like } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";
import type { Metadata } from "next";

const ARTICLES_PER_PAGE = 15;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  const [categoryData] = await db
    .select()
    .from(category)
    .where(eq(category.slug, slug))
    .limit(1);

  if (!categoryData) {
    return {
      title: "Kategori ikke fundet",
    };
  }

  return {
    title: `${categoryData.name} - Nyheder`,
    description:
      categoryData.description ||
      `Læs de seneste nyheder om ${categoryData.name.toLowerCase()}`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  // Fetch category by slug
  const [categoryData] = await db
    .select()
    .from(category)
    .where(eq(category.slug, slug))
    .limit(1);

  // Return 404 if category not found
  if (!categoryData) {
    notFound();
  }

  // Fetch articles that contain this category
  // Since categories are stored as comma-separated strings, we use LIKE
  const categoryPattern = `%${categoryData.name}%`;

  const [articles, totalCountResult] = await Promise.all([
    db
      .select()
      .from(article)
      .where(
        sql`${article.status} = 'published' AND ${article.categories} LIKE ${categoryPattern}`
      )
      .orderBy(desc(article.publishedDate))
      .limit(ARTICLES_PER_PAGE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(article)
      .where(
        sql`${article.status} = 'published' AND ${article.categories} LIKE ${categoryPattern}`
      ),
  ]);

  const totalCount = Number(totalCountResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  return (
    <div className="flex-1">
      {/* Category Header */}
      <header className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {categoryData.name}
          </h1>
          {categoryData.description && (
            <p className="text-xl text-muted-foreground">
              {categoryData.description}
            </p>
          )}
        </div>
      </header>

      {/* Articles Section */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {articles.length === 0 ? (
          <section className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Ingen artikler fundet i denne kategori
            </p>
          </section>
        ) : (
          <>
            {/* Section Headline */}
            <h2 className="text-3xl font-bold mb-8">
              Seneste fra {categoryData.name}
            </h2>

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
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
