import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <Link href={`/nyheder/${slug}`} className="group">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        {/* Article Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
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

        {/* Article Content */}
        <CardHeader className="space-y-2">
          {/* Categories */}
          {categoryList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoryList.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="line-clamp-2 text-xl font-semibold group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Summary */}
          {truncatedSummary && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {truncatedSummary}
            </p>
          )}

          {/* Published Date */}
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
