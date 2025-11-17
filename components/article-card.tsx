import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArticleCategories } from "@/components/article-categories";

interface ArticleCardProps {
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  publishedDate: Date;
  categories: string | null;
}

export function ArticleCard({
  title,
  slug,
  summary,
  image,
  publishedDate,
  categories,
}: ArticleCardProps) {
  // Truncate summary to ~150 characters
  const truncatedSummary = summary
    ? summary.length > 150
      ? summary.substring(0, 150).trim() + "..."
      : summary
    : "";

  // Parse categories from comma-separated string
  const categoryList = categories
    ? categories.split(",").map((cat) => cat.trim())
    : [];

  // Format date in Danish
  const formattedDate = format(publishedDate, "d. MMMM yyyy", { locale: da });

  return (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg p-0 gap-0 group">
      <Link href={`/nyheder/${slug}`}>
        {/* Article Image - smaller aspect ratio */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted max-h-[300px]">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <p className="text-muted-foreground">Intet foto</p>
            </div>
          )}
        </div>
      </Link>

      {/* Article Content - using flex column with auto margins for date positioning */}
      <div className="flex flex-col p-4 flex-1">
        {/* Categories */}
        <ArticleCategories categories={categoryList} />

        {/* Title */}
        <Link href={`/nyheder/${slug}`}>
          <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors mb-2">
            {title}
          </h3>
        </Link>

        {/* Summary */}
        {truncatedSummary && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {truncatedSummary}
          </p>
        )}

        {/* Published Date - pushed to bottom */}
        <p className="text-xs text-muted-foreground mt-auto">
          {formattedDate}
        </p>
      </div>
    </Card>
  );
}
