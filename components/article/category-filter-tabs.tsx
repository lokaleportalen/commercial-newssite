"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/types";

interface CategoryFilterTabsProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export function CategoryFilterTabs({
  selectedCategories,
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

  const handleToggleCategory = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      // Remove category
      const newCategories = selectedCategories.filter((c) => c !== categorySlug);
      onCategoryChange(newCategories.length > 0 ? newCategories : []);
    } else {
      // Add category
      onCategoryChange([...selectedCategories, categorySlug]);
    }
  };

  const handleClearAll = () => {
    onCategoryChange([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getButtonLabel = () => {
    if (selectedCategories.length === 0) {
      return "Alle kategorier";
    }
    if (selectedCategories.length === 1) {
      const category = categories.find((cat) => cat.slug === selectedCategories[0]);
      return category?.name || "1 kategori";
    }
    return `${selectedCategories.length} kategorier`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {getButtonLabel()}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <div className="p-2 space-y-2">
          {selectedCategories.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-foreground w-full text-left px-2 py-1"
            >
              Ryd alle
            </button>
          )}
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center space-x-2 cursor-pointer rounded-md px-2 py-2 hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                handleToggleCategory(category.slug);
              }}
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleToggleCategory(category.slug)}
                className="rounded-[2px]"
              />
              <span className="text-sm flex-1">{category.name}</span>
            </label>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
