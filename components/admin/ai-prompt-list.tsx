"use client";

import { useEffect, useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AiPrompt = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  model: string;
  section: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
};

type AiPromptListProps = {
  selectedPromptId: string | null;
  onSelectPrompt: (id: string) => void;
};

// Define the order of sections
const SECTION_ORDER = ["Weekly News", "Article Generation", "Image Generation"];

export function AiPromptList({
  selectedPromptId,
  onSelectPrompt,
}: AiPromptListProps) {
  const [prompts, setPrompts] = useState<AiPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch prompts
  useEffect(() => {
    async function fetchPrompts() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/ai-prompts");
        if (response.ok) {
          const data = await response.json();
          setPrompts(data.prompts);
        }
      } catch (error) {
        console.error("Error fetching AI prompts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrompts();
  }, []);

  // Group prompts by section and sort by defined order
  const groupedPrompts = useMemo(() => {
    const groups: Record<string, AiPrompt[]> = {};

    prompts.forEach((prompt) => {
      if (!groups[prompt.section]) {
        groups[prompt.section] = [];
      }
      groups[prompt.section].push(prompt);
    });

    // Convert to array and sort by section order
    const sortedEntries = Object.entries(groups).sort(
      ([sectionA], [sectionB]) => {
        const indexA = SECTION_ORDER.indexOf(sectionA);
        const indexB = SECTION_ORDER.indexOf(sectionB);

        // If section not in order list, put it at the end
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      }
    );

    return sortedEntries;
  }, [prompts]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-bold mb-1">AI Prompts</h2>
        <p className="text-xs text-muted-foreground">
          Select a prompt to view and edit
        </p>
      </div>

      {/* Prompt List */}
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
          ) : prompts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No AI prompts configured yet
            </div>
          ) : (
            groupedPrompts.map(([section, sectionPrompts], sectionIndex) => (
              <div key={section} className="mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">
                  {sectionIndex + 1}. {section}
                </h3>
                {sectionPrompts.map((prompt, index) => (
                  <div key={prompt.id}>
                    <button
                      onClick={() => onSelectPrompt(prompt.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors",
                        "hover:bg-accent",
                        selectedPromptId === prompt.id
                          ? "bg-accent border-2 border-primary"
                          : "border border-transparent"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {prompt.name}
                        </h4>
                      </div>
                      {prompt.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {prompt.description}
                        </p>
                      )}
                    </button>
                    {sectionPrompts.length > 1 &&
                      index < sectionPrompts.length - 1 && (
                        <Separator className="my-2" />
                      )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with count */}
      <div className="border-t p-4 text-sm text-muted-foreground">
        {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"}
      </div>
    </div>
  );
}
