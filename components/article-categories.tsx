"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ArticleCategoriesProps {
  categories: string[];
}

export function ArticleCategories({ categories }: ArticleCategoriesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (categories.length === 0) return null;

  const visibleCategories = isExpanded ? categories : categories.slice(0, 3);
  const hasMore = categories.length > 3;
  const remainingCount = categories.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      {visibleCategories.map((category, index) => (
        <div key={index} className="contents">
          <span className="text-xs font-medium text-muted-foreground">
            {category}
          </span>
          {index < visibleCategories.length - 1 && (
            <span className="text-xs ">|</span>
          )}
        </div>
      ))}

      {hasMore && !isExpanded && (
        <>
          <span className="text-xs">|</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            +{remainingCount}
            <ChevronDown className="h-3 w-3" />
          </button>
        </>
      )}

      {hasMore && isExpanded && (
        <>
          <span className="text-xs text-muted-foreground">|</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            Vis mindre
            <ChevronDown className="h-3 w-3 rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}
