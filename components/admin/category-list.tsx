"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryListProps = {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
};

export function CategoryList({
  selectedCategoryId,
  onSelectCategory,
}: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Expose refresh function to parent
  useEffect(() => {
    (window as any).refreshCategories = fetchCategories;
    return () => {
      delete (window as any).refreshCategories;
    };
  }, []);

  const handleNewCategory = () => {
    onSelectCategory("new");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-bold mb-1">Categories</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Manage article categories
        </p>
        <Button
          onClick={handleNewCategory}
          size="sm"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Category List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 mb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No categories yet. Create your first category!
            </div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg mb-2 transition-colors",
                  "hover:bg-accent",
                  selectedCategoryId === category.id
                    ? "bg-accent border-2 border-primary"
                    : "border border-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm line-clamp-1">
                    {category.name}
                  </h4>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {category.slug}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with count */}
      <div className="border-t p-4 text-sm text-muted-foreground">
        {categories.length} {categories.length === 1 ? "category" : "categories"}
      </div>
    </div>
  );
}
