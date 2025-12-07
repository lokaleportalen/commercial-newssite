"use client";

import { useRouter } from "next/navigation";
import { CategoryFilterTabs } from "./category-filter-tabs";

interface CategoryFilterWrapperProps {
  selectedCategory: string;
}

export function CategoryFilterWrapper({ selectedCategory }: CategoryFilterWrapperProps) {
  const router = useRouter();

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      router.push("/");
    } else {
      router.push(`/?category=${category}`);
    }
  };

  return (
    <CategoryFilterTabs
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
    />
  );
}
