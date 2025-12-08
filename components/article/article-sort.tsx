"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

interface ArticleSortProps {
  currentSort: SortOption;
}

const SORT_OPTIONS = [
  { value: "newest" as const, label: "Nyeste først" },
  { value: "oldest" as const, label: "Ældste først" },
  { value: "title-asc" as const, label: "Titel (A-Å)" },
  { value: "title-desc" as const, label: "Titel (Å-A)" },
];

export function ArticleSort({ currentSort }: ArticleSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());

    // Set sort parameter
    params.set("sort", value);

    // Reset to page 1 when sorting changes
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
