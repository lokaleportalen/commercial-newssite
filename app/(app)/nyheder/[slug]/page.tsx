import { getPayload } from "payload";
import config from "@payload-config";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import { CategoryLink } from "@/components/category-link";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config });

  const { docs: articles } = await payload.find({
    collection: "articles",
    where: { slug: { equals: slug } },
    limit: 1,
  });

  const articleData = articles[0];

  if (!articleData) {
    return {
      title: "Artikel ikke fundet",
    };
  }

  return {
    title: articleData.title,
    description: articleData.metaDescription || articleData.summary || "",
    openGraph: {
      title: articleData.title,
      description: articleData.metaDescription || articleData.summary || "",
      type: "article",
      publishedTime: articleData.publishedDate,
      images: articleData.featuredImage?.url ? [articleData.featuredImage.url] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const payload = await getPayload({ config });

  // Fetch article by slug
  const { docs: articles } = await payload.find({
    collection: "articles",
    where: { slug: { equals: slug } },
    limit: 1,
  });

  const articleData = articles[0];

  // Return 404 if article not found
  if (!articleData) {
    notFound();
  }

  // Get category names
  const categoryList: string[] = [];
  if (articleData.categories && Array.isArray(articleData.categories)) {
    articleData.categories.forEach((cat: any) => {
      if (typeof cat === "string") {
        categoryList.push(cat);
      } else if (cat.name) {
        categoryList.push(cat.name);
      }
    });
  }

  // Format date in Danish
  const formattedDate = format(new Date(articleData.publishedDate), "d. MMMM yyyy", {
    locale: da,
  });

  // Extract text content from Lexical content
  // For now, we'll use a simple extraction. You may want to implement proper Lexical rendering
  let contentText = "";
  if (articleData.content && typeof articleData.content === "object") {
    // Simple text extraction from Lexical format
    const root = (articleData.content as any).root;
    if (root && root.children) {
      root.children.forEach((child: any) => {
        if (child.children) {
          child.children.forEach((textNode: any) => {
            if (textNode.text) {
              contentText += textNode.text + "\n\n";
            }
          });
        }
      });
    }
  }

  return (
    <article className="min-h-screen">
      <header className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {categoryList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categoryList.map((category, index) => (
                <CategoryLink key={index} category={category} variant="badge" />
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {articleData.title}
          </h1>

          {articleData.summary && (
            <p className="text-xl text-muted-foreground mb-4">
              {articleData.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={articleData.publishedDate}>
              {formattedDate}
            </time>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {articleData.featuredImage?.url && (
          <div className="relative w-full aspect-video max-w-4xl mx-auto mb-8">
            <Image
              src={articleData.featuredImage.url}
              alt={articleData.title}
              fill
              className="object-cover rounded-lg"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        )}
        <div className="prose max-w-none">
          <ReactMarkdown>{contentText}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
