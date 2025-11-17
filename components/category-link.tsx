import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryLinkProps {
  category: string;
  variant?: "default" | "badge";
  className?: string;
}

/**
 * Convert a category name to a URL-friendly slug
 */
function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryLink({
  category,
  variant = "default",
  className,
}: CategoryLinkProps) {
  const slug = categoryToSlug(category);
  const href = `/${slug}`;

  if (variant === "badge") {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20 transition-colors",
          className
        )}
      >
        {category}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      {category}
    </Link>
  );
}
