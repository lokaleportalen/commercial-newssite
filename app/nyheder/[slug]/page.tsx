import { db } from "@/database/db";
import { article, aiPrompt } from "@/database/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { CategoryLink } from "@/components/article/category-link";
import { ArticleContent } from "@/components/article/article-content";
import { RelatedArticles } from "@/components/article/related-articles";
import { ShareButtons } from "@/components/article/share-buttons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getArticleCategories } from "@/lib/category-helpers";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const [articleData] = await db
    .select()
    .from(article)
    .where(eq(article.slug, slug))
    .limit(1);

  if (!articleData) {
    return {
      title: "Artikel ikke fundet",
    };
  }

  return {
    title: articleData.title,
    description: articleData.metaDescription || articleData.summary || "",
    openGraph: {
      title: articleData.title,
      description: articleData.metaDescription || articleData.summary || "",
      type: "article",
      publishedTime: articleData.publishedDate.toISOString(),
      images: articleData.image ? [articleData.image] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Fetch article by slug with prompt information
  const [result] = await db
    .select({
      article: article,
      prompt: aiPrompt,
    })
    .from(article)
    .leftJoin(aiPrompt, eq(article.promptId, aiPrompt.id))
    .where(eq(article.slug, slug))
    .limit(1);

  // Return 404 if article not found
  if (!result) {
    notFound();
  }

  const articleData = result.article;
  const promptData = result.prompt;

  // Check authentication status
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  // Fetch categories from junction table
  const categories = await getArticleCategories(articleData.id);

  // Get primary category for breadcrumb (first category)
  const primaryCategory = categories.length > 0 ? categories[0] : null;

  // Format date in Danish
  const formattedDate = format(articleData.publishedDate, "d. MMMM yyyy", {
    locale: da,
  });

  // Construct full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const articleUrl = `${baseUrl}/nyheder/${articleData.slug}`;

  return (
    <main className="mb-16">
      <article className="min-h-screen">
        <header className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Breadcrumbs */}
            <Breadcrumbs
              items={
                primaryCategory
                  ? [
                      {
                        label: primaryCategory.name,
                        href: `/${primaryCategory.slug}`,
                      },
                      { label: articleData.title },
                    ]
                  : [{ label: articleData.title }]
              }
              className="mb-6"
            />

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <CategoryLink
                    key={category.id}
                    category={category.name}
                    variant="badge"
                  />
                ))}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {articleData.title}
            </h1>

            {articleData.summary && (
              <p className="text-xl text-muted-foreground mb-4">
                {articleData.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={articleData.publishedDate.toISOString()}>
                {formattedDate}
              </time>
              {promptData && (
                <>
                  <span>•</span>
                  <span>Prompt ID: {promptData.id}</span>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {articleData.image && (
            <div className="relative w-full aspect-video max-w-4xl mx-auto mb-8">
              <Image
                src={articleData.image}
                alt={articleData.title}
                fill
                className="object-cover rounded-lg"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}
          <ArticleContent
            content={articleData.content}
            isAuthenticated={isAuthenticated}
          />

          {/* Share Buttons */}
          <ShareButtons
            title={articleData.title}
            url={articleUrl}
            summary={articleData.summary}
          />
        </div>

        {/* Related Articles */}
        <RelatedArticles articleId={articleData.id} />
      </article>
    </main>
  );
}
