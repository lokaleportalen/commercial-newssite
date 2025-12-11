"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types";

type CategorySelectProps = {
  selectedCategories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  maxCategories?: number;
};

export function CategorySelect({
  selectedCategories,
  onCategoriesChange,
  maxCategories = 3,
}: CategorySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch categories on mount
  React.useEffect(() => {
    async function fetchCategories() {
      try {
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
    }

    fetchCategories();
  }, []);

  const handleSelect = (category: Category) => {
    const isSelected = selectedCategories.some((c) => c.id === category.id);

    if (isSelected) {
      // Remove category
      onCategoriesChange(
        selectedCategories.filter((c) => c.id !== category.id)
      );
    } else {
      // Add category if under limit
      if (selectedCategories.length < maxCategories) {
        onCategoriesChange([...selectedCategories, category]);
      }
    }
  };

  const handleRemove = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoriesChange(selectedCategories.filter((c) => c.id !== categoryId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 py-2"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedCategories.length === 0 ? (
              <span className="text-muted-foreground">
                Select categories...
              </span>
            ) : (
              selectedCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="mr-1 bg-primary text-primary-foreground hover:bg-primary"
                >
                  {category.name}
                  <span
                    onClick={(e) => handleRemove(category.id, e)}
                    className="ml-1 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRemove(category.id, e as any);
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading categories..." : "No category found."}
            </CommandEmpty>
            <CommandGroup>
              {categories.map((category) => {
                const isSelected = selectedCategories.some(
                  (c) => c.id === category.id
                );
                const isDisabled =
                  !isSelected && selectedCategories.length >= maxCategories;

                return (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      if (!isDisabled) {
                        handleSelect(category);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
