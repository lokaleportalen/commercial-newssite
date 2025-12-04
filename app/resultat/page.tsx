"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ArticleCard } from "@/components/article/article-card";
import type { Category } from "@/lib/category-helpers";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  publishedDate: Date;
  categories: Category[];
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Fetch results when query param changes
  useEffect(() => {
    const fetchResults = async () => {
      if (queryParam.length < 4) {
        setResults([]);
        setSearched(false);
        return;
      }

      setLoading(true);
      setSearched(true);
      try {
        const response = await fetch(
          `/api/articles?search=${encodeURIComponent(queryParam)}`
        );
        if (response.ok) {
          const data = await response.json();
          // Convert date strings to Date objects
          const articlesWithDates = data.articles.map((article: any) => ({
            ...article,
            publishedDate: new Date(article.publishedDate),
          }));
          setResults(articlesWithDates);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [queryParam]);

  // Update URL when search is submitted
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/resultat?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex-1">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">Søgeresultater</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Søg efter artikler..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>
            {query.length > 0 && query.length < 4 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Indtast mindst 4 tegn for at søge
              </p>
            )}
          </form>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && searched && queryParam.length >= 4 && results.length === 0 && (
          <div className="text-center py-16">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Ingen resultater fundet</h2>
            <p className="text-muted-foreground">
              Prøv at søge med andre ord eller udtryk
            </p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Søg efter artikler</h2>
            <p className="text-muted-foreground">
              Indtast mindst 4 tegn i søgefeltet ovenfor
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {results.length} {results.length === 1 ? "resultat" : "resultater"}{" "}
                fundet for <span className="font-medium text-foreground">&quot;{queryParam}&quot;</span>
              </p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  summary={article.summary}
                  image={article.image}
                  publishedDate={article.publishedDate}
                  categories={article.categories}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1">
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-6">Søgeresultater</h1>
            <div className="max-w-2xl h-12 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
