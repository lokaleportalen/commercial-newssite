"use client";

import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getContentPreview } from "@/lib/content-helpers";

interface ArticlePaywallProps {
  content: string;
}

export function ArticlePaywall({ content }: ArticlePaywallProps) {
  const previewContent = getContentPreview(content, 400);
  const remainingContent = content.substring(previewContent.length);

  return (
    <div className="relative">
      {/* Preview Content */}
      <div className="prose max-w-none">
        <ReactMarkdown>{previewContent}</ReactMarkdown>
      </div>

      {/* Blurred Content */}
      <div className="relative overflow-hidden">
        <div className="prose max-w-none blur-sm select-none pointer-events-none">
          <ReactMarkdown>{remainingContent}</ReactMarkdown>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />

        {/* CTA Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4 py-8 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Fortsæt med at læse</h3>
            <p className="text-muted-foreground mb-6">
              Tilmeld dig gratis for at få adgang til hele artiklen og meget mere.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/signup">Opret konto</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Log ind</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
