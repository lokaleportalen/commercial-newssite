"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Mail, MailCheck, MailX } from "lucide-react";

type EmailTemplate = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  subject: string;
  previewText: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type EmailTemplateListProps = {
  selectedTemplateId: string | null;
  onSelectTemplate: (id: string) => void;
};

export function EmailTemplateList({
  selectedTemplateId,
  onSelectTemplate,
}: EmailTemplateListProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/email-templates");
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error("Error fetching email templates:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-bold mb-1">Email Templates</h2>
        <p className="text-xs text-muted-foreground">
          Vælg en skabelon for at se og redigere
        </p>
      </div>

      {/* Template List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 mb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : templates.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Ingen email-skabeloner konfigureret endnu
            </div>
          ) : (
            templates.map((template, index) => (
              <div key={template.id}>
                <button
                  onClick={() => onSelectTemplate(template.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    "hover:bg-accent",
                    selectedTemplateId === template.id
                      ? "bg-accent border-2 border-primary"
                      : "border border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {template.isActive ? (
                        <MailCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <MailX className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {template.name}
                      </h4>
                    </div>
                  </div>
                  {template.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {template.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {template.isActive ? (
                      <Badge variant="default" className="text-xs bg-green-600">
                        Aktiv
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Inaktiv
                      </Badge>
                    )}
                  </div>
                </button>
                {index < templates.length - 1 && <Separator className="my-2" />}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with count */}
      <div className="border-t p-4 text-sm text-muted-foreground">
        {templates.length} {templates.length === 1 ? "skabelon" : "skabeloner"}
      </div>
    </div>
  );
}
