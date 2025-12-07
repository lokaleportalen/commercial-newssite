import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface CategoryHeroProps {
  categoryName: string;
  categoryDescription?: string | null;
  featuredArticle: Article | null;
  totalArticles: number;
}

export function CategoryHero({
  categoryName,
  categoryDescription,
  featuredArticle,
  totalArticles,
}: CategoryHeroProps) {
  // If no featured article, show text-only header
  if (!featuredArticle) {
    return (
      <header className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-sm">
              {totalArticles} {totalArticles === 1 ? "artikel" : "artikler"}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {categoryName}
          </h1>
          {categoryDescription && (
            <p className="text-xl text-muted-foreground max-w-2xl">
              {categoryDescription}
            </p>
          )}
        </div>
      </header>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="relative h-[350px] overflow-hidden group p-0 transition-shadow hover:shadow-xl">
        {/* Background Image */}
        <div className="absolute inset-0">
          {featuredArticle.image ? (
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <p className="text-muted-foreground text-lg">Intet foto</p>
            </div>
          )}
          {/* Gradient Overlay - stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
          {/* Category Badge & Article Count */}
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold">
              {categoryName}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm text-sm">
              {totalArticles} {totalArticles === 1 ? "artikel" : "artikler"}
            </Badge>
          </div>

          {/* Category Description (if available) */}
          {categoryDescription && (
            <p className="text-sm text-white/90 mb-3 max-w-3xl line-clamp-1">
              {categoryDescription}
            </p>
          )}

          {/* Featured Article Title */}
          <div className="mb-4">
            <p className="text-xs text-white/70 mb-1 uppercase tracking-wide font-medium">
              Seneste artikel
            </p>
            <Link href={`/nyheder/${featuredArticle.slug}`}>
              <h2 className="text-2xl md:text-3xl font-bold line-clamp-2 hover:underline transition-all">
                {featuredArticle.title}
              </h2>
            </Link>
          </div>

          {/* Featured Article Summary */}
          {featuredArticle.summary && (
            <p className="text-sm text-white/80 mb-4 line-clamp-2 max-w-2xl">
              {featuredArticle.summary}
            </p>
          )}

          {/* CTA Button */}
          <div>
            <Link href={`/nyheder/${featuredArticle.slug}`}>
              <Button
                variant="default"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Se artikel
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </section>
  );
}
