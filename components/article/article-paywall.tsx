"use client";

import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ArticlePaywallProps {
  previewContent: string;
  extendedContent: string;
}

export function ArticlePaywall({
  previewContent,
  extendedContent,
}: ArticlePaywallProps) {
  return (
    <div className="relative pb-24 px-4 sm:px-0">
      {/* Content with linear fade from 0-40% */}
      <div
        className="prose max-w-none select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)',
        }}
      >
        <ReactMarkdown>{extendedContent}</ReactMarkdown>
      </div>

      {/* CTA Overlay - positioned higher in the content */}
      <div className="absolute left-0 right-0 top-[25%] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto px-4 py-8 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg">
          <h3 className="text-2xl font-bold mb-2">Fortsæt med at læse</h3>
          <p className="text-muted-foreground mb-6">
            Tilmeld dig gratis for at få adgang til hele artiklen.
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
  );
}
