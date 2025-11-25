import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArticleCard } from "@/components/article/article-card";
import { CategoryLink } from "@/components/article/category-link";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  publishedDate: Date;
  categories: string | null;
}

interface HeroSectionProps {
  articles: Article[];
}

export function HeroSection({ articles }: HeroSectionProps) {
  if (articles.length === 0) return null;

  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  const featuredCategory = featuredArticle.categories
    ? featuredArticle.categories.split(",")[0].trim()
    : null;

  return (
    <section className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="relative h-full min-h-[400px] lg:min-h-[450px] overflow-hidden group p-0 transition-shadow hover:shadow-xl">
            <div className="absolute inset-0">
              {featuredArticle.image ? (
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Intet foto</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {featuredCategory && (
                <CategoryLink
                  category={featuredCategory}
                  variant="badge"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 mb-3"
                />
              )}

              <Link href={`/nyheder/${featuredArticle.slug}`}>
                <h2 className="text-2xl lg:text-3xl font-bold mb-3 line-clamp-3 hover:underline transition-colors">
                  {featuredArticle.title}
                </h2>
              </Link>

              {featuredArticle.summary && (
                <p className="text-sm text-white/80 mb-4 line-clamp-2 max-w-xl">
                  {featuredArticle.summary}
                </p>
              )}

              <Link href={`/nyheder/${featuredArticle.slug}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer"
                >
                  Læs artikel
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {sideArticles.map((article) => (
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
      </div>
    </section>
  );
}
