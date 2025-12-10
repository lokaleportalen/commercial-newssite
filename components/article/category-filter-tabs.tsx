"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
}

interface CategoryFilterTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilterTabs({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterTabsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      <Badge
        variant={selectedCategory === "all" ? "default" : "outline"}
        className="cursor-pointer whitespace-nowrap"
        onClick={() => onCategoryChange("all")}
      >
        Alle kategorier
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.slug ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => onCategoryChange(category.slug)}
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
}
