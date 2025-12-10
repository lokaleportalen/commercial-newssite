"use client";

import ReactMarkdown from "react-markdown";
import { ArticlePaywall } from "./article-paywall";
import { getContentPreview, normalizeArticleHeadings } from "@/lib/content-helpers";

interface ArticleContentProps {
  content: string;
  isAuthenticated: boolean;
}

export function ArticleContent({ content, isAuthenticated }: ArticleContentProps) {
  if (isAuthenticated) {
    // Normalize h1 to h2 for proper heading hierarchy (page title is the only h1)
    const normalizedContent = normalizeArticleHeadings(content);
    return (
      <div className="prose max-w-none">
        <ReactMarkdown>{normalizedContent}</ReactMarkdown>
      </div>
    );
  }

  // Only pass preview content to paywall - never send full content to client
  const previewContent = getContentPreview(content, 400);
  return <ArticlePaywall previewContent={previewContent} />;
}
