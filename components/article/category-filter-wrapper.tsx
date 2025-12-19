"use client";

import { useRouter } from "next/navigation";
import { CategoryFilterTabs } from "./category-filter-tabs";
import { ArticleSort, SortOption } from "./article-sort";

interface CategoryFilterWrapperProps {
  selectedCategories: string[];
  basePath?: string;
  currentSort?: SortOption;
}

export function CategoryFilterWrapper({
  selectedCategories,
  basePath = "/",
  currentSort = "newest",
}: CategoryFilterWrapperProps) {
  const router = useRouter();

  const handleCategoryChange = (categories: string[]) => {
    const params = new URLSearchParams();

    if (categories.length > 0) {
      params.set("category", categories.join(","));
    }

    if (currentSort !== "newest") {
      params.set("sort", currentSort);
    }

    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  };

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between py-4 gap-4">
          <CategoryFilterTabs
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
          />
          <ArticleSort currentSort={currentSort} />
        </div>
      </div>
    </div>
  );
}
