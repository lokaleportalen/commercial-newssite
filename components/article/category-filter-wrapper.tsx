"use client";

import { useRouter } from "next/navigation";
import { CategoryFilterTabs } from "./category-filter-tabs";
import { ArticleSort, SortOption } from "./article-sort";

interface CategoryFilterWrapperProps {
  selectedCategory: string;
  basePath?: string;
  currentSort?: SortOption;
}

export function CategoryFilterWrapper({
  selectedCategory,
  basePath = "/",
  currentSort = "newest",
}: CategoryFilterWrapperProps) {
  const router = useRouter();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams();

    if (category !== "all") {
      params.set("category", category);
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
          <div className="flex-1 overflow-x-auto">
            <CategoryFilterTabs
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
          <ArticleSort currentSort={currentSort} />
        </div>
      </div>
    </div>
  );
}
