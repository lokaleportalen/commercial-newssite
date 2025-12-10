"use client";

import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ArticlePaywallProps {
  previewContent: string;
}

export function ArticlePaywall({ previewContent }: ArticlePaywallProps) {
  return (
    <div className="relative">
      {/* Preview Content with Fade-Out Effect */}
      <div className="prose max-w-none pb-32 [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
        <ReactMarkdown>{previewContent}</ReactMarkdown>
      </div>

      {/* CTA Overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8 pt-24 bg-gradient-to-b from-transparent to-background">
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
