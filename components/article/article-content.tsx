"use client";

import ReactMarkdown from "react-markdown";
import { ArticlePaywall } from "./article-paywall";

interface ArticleContentProps {
  content: string;
  isAuthenticated: boolean;
}

export function ArticleContent({ content, isAuthenticated }: ArticleContentProps) {
  if (isAuthenticated) {
    return (
      <div className="prose max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  return <ArticlePaywall content={content} />;
}
