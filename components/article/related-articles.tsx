"use client";

import { useEffect, useState } from "react";
import { ArticleCard } from "@/components/article/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/lib/category-helpers";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  publishedDate: Date;
  categories: Category[];
}

interface ArticleFromAPI {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  publishedDate: string;
  categories: Category[];
}

interface RelatedArticlesProps {
  articleId: string;
}

export function RelatedArticles({ articleId }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedArticles() {
      try {
        const response = await fetch(`/api/articles/${articleId}/related`);
        if (response.ok) {
          const data = await response.json();
          // Convert date strings to Date objects
          const articlesWithDates = data.articles.map((article: ArticleFromAPI): Article => ({
            ...article,
            publishedDate: new Date(article.publishedDate),
          }));
          setArticles(articlesWithDates);
        }
      } catch (error) {
        console.error("Error fetching related articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedArticles();
  }, [articleId]);

  // Don't render if no related articles
  if (!loading && articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 border-t pt-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Relaterede artikler</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                slug={article.slug}
                summary={article.summary}
                image={article.image}
                publishedDate={article.publishedDate}
                categories={article.categories}
                variant="small"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
