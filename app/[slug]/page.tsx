import { db } from "@/database/db";
import { article, category, articleCategory } from "@/database/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/article-card";
import { Pagination } from "@/components/article/pagination";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CategoryHero } from "@/components/article/category-hero";
import { getArticleCategoriesBulk } from "@/lib/category-helpers";
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
  const isFirstPage = currentPage === 1;

  // For first page, we show featured article in hero, so offset grid articles
  const offset = isFirstPage
    ? 0
    : (currentPage - 1) * ARTICLES_PER_PAGE - 1; // -1 because first page shows featured article

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

  // Fetch articles that contain this category using junction table
  // Subquery to find article IDs for this category
  const categoryArticleIds = db
    .select({ articleId: articleCategory.articleId })
    .from(articleCategory)
    .innerJoin(category, eq(articleCategory.categoryId, category.id))
    .where(eq(category.slug, slug));

  const [articles, totalCountResult] = await Promise.all([
    db
      .select()
      .from(article)
      .where(
        and(
          eq(article.status, "published"),
          inArray(article.id, categoryArticleIds)
        )
      )
      .orderBy(desc(article.publishedDate))
      .limit(isFirstPage ? ARTICLES_PER_PAGE + 1 : ARTICLES_PER_PAGE) // +1 for featured article on first page
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(article)
      .where(
        and(
          eq(article.status, "published"),
          inArray(article.id, categoryArticleIds)
        )
      ),
  ]);

  // Fetch categories for all articles in bulk (avoid N+1 queries)
  const articleIds = articles.map((a) => a.id);
  const categoriesMap = await getArticleCategoriesBulk(articleIds);

  // Merge categories into articles
  const articlesWithCategories = articles.map((art) => ({
    ...art,
    categories: categoriesMap.get(art.id) || [],
  }));

  // Split featured article and grid articles for first page
  const featuredArticle = isFirstPage && articlesWithCategories.length > 0
    ? articlesWithCategories[0]
    : null;
  const gridArticles = isFirstPage && articlesWithCategories.length > 0
    ? articlesWithCategories.slice(1)
    : articlesWithCategories;

  const totalCount = Number(totalCountResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  return (
    <div className="flex-1">
      {/* Breadcrumbs - above hero */}
      <div className="container mx-auto px-4 pt-4 max-w-6xl">
        <Breadcrumbs
          items={[{ label: categoryData.name }]}
          className="mb-0"
        />
      </div>

      {/* Category Hero - only on first page */}
      {isFirstPage && (
        <CategoryHero
          categoryName={categoryData.name}
          categoryDescription={categoryData.description}
          featuredArticle={featuredArticle}
          totalArticles={totalCount}
        />
      )}

      {/* Simple header for pagination pages */}
      {!isFirstPage && (
        <header className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
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
      )}

      {/* Articles Section */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {gridArticles.length === 0 ? (
          <section className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Ingen artikler fundet i denne kategori
            </p>
          </section>
        ) : (
          <>
            {/* Section Headline */}
            <h2 className="text-3xl font-bold mb-8">
              {isFirstPage ? `Mere fra ${categoryData.name}` : `Seneste fra ${categoryData.name}`}
            </h2>

            {/* Articles Grid */}
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
