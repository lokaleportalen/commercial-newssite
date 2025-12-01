"use client";

import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ArticlePaywallProps {
  content: string;
}

export function ArticlePaywall({ content }: ArticlePaywallProps) {
  return (
    <div className="relative">
      {/* Preview Content */}
      <div className="prose max-w-none pb-8">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      {/* Blurred Placeholder Section */}
      <div className="relative overflow-hidden min-h-[600px] -mt-8">
        {/* Create visual blur effect with repeated placeholder text */}
        <div className="prose max-w-none blur-md select-none pointer-events-none opacity-40 px-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background pointer-events-none" />

        {/* CTA Overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto px-6 py-8 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg">
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
