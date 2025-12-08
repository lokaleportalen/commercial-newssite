import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategoryHeroProps {
  categoryName: string;
  categoryDescription?: string | null;
  heroImage?: string | null;
  totalArticles: number;
}

export function CategoryHero({
  categoryName,
  categoryDescription,
  heroImage,
  totalArticles,
}: CategoryHeroProps) {
  // If no hero image, show text-only header
  if (!heroImage) {
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
      <Card className="relative h-[400px] overflow-hidden group p-0 transition-shadow hover:shadow-xl">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={`${categoryName} hero image`}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
          {/* Gradient Overlay - stronger at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white">
          {/* Category Name */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {categoryName}
          </h1>

          {/* Category Description */}
          {categoryDescription && (
            <p className="text-lg md:text-xl text-white/90 mb-4 max-w-3xl">
              {categoryDescription}
            </p>
          )}

          {/* Article Count Badge */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm text-sm">
              {totalArticles} {totalArticles === 1 ? "artikel" : "artikler"}
            </Badge>
          </div>
        </div>
      </Card>
    </section>
  );
}
