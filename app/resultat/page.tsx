"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArticleCard } from "@/components/article/article-card";
import type { Category } from "@/types";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  publishedDate: Date;
  categories: Category[];
}

interface ArticleFromAPI {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  publishedDate: string;
  categories: Category[];
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "all";
  const sortParam = searchParams.get("sort") || "date-desc";

  const [query, setQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [results, setResults] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch results when params change
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
        const params = new URLSearchParams();
        params.set("search", queryParam);
        if (selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }
        params.set("sort", selectedSort);

        const response = await fetch(`/api/articles?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          // Convert date strings to Date objects
          const articlesWithDates = data.articles.map(
            (article: ArticleFromAPI): Article => ({
              ...article,
              publishedDate: new Date(article.publishedDate),
            })
          );
          setResults(articlesWithDates);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [queryParam, selectedCategory, selectedSort]);

  // Update URL when search is submitted
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set("q", query.trim());
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      if (selectedSort !== "date-desc") {
        params.set("sort", selectedSort);
      }
      router.push(`/resultat?${params.toString()}`);
    }
  };

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    params.set("q", queryParam);
    if (category !== "all") {
      params.set("category", category);
    }
    if (selectedSort !== "date-desc") {
      params.set("sort", selectedSort);
    }
    router.push(`/resultat?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    const params = new URLSearchParams();
    params.set("q", queryParam);
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    if (sort !== "date-desc") {
      params.set("sort", sort);
    }
    router.push(`/resultat?${params.toString()}`);
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
        {/* Filters and Sort */}
        {searched && queryParam.length >= 4 && (
          <nav aria-label="Filter options" className="mb-8 space-y-4">
            {/* Category Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Filtrer efter kategori</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryChange("all")}
                >
                  Alle kategorier
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={
                      selectedCategory === category.name ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleCategoryChange(category.name)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium">Sorter</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedSort === "date-desc" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSortChange("date-desc")}
                >
                  Nyeste først
                </Badge>
                <Badge
                  variant={selectedSort === "date-asc" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSortChange("date-asc")}
                >
                  Ældste først
                </Badge>
                <Badge
                  variant={selectedSort === "title-asc" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSortChange("title-asc")}
                >
                  Titel A-Å
                </Badge>
                <Badge
                  variant={
                    selectedSort === "title-desc" ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleSortChange("title-desc")}
                >
                  Titel Å-A
                </Badge>
              </div>
            </div>
          </nav>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading &&
          searched &&
          queryParam.length >= 4 &&
          results.length === 0 && (
            <div className="text-center py-16">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                Ingen resultater fundet
              </h2>
              <p className="text-muted-foreground">
                Prøv at søge med andre ord eller udtryk
                {selectedCategory !== "all" && ", eller vælg en anden kategori"}
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
            <header className="mb-6">
              <p className="text-muted-foreground">
                {results.length}{" "}
                {results.length === 1 ? "resultat" : "resultater"} fundet for{" "}
                <span className="font-medium text-foreground">
                  &quot;{queryParam}&quot;
                </span>
                {selectedCategory !== "all" && (
                  <span>
                    {" "}
                    i kategori{" "}
                    <span className="font-medium text-foreground">
                      {selectedCategory}
                    </span>
                  </span>
                )}
              </p>
            </header>

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
    <Suspense
      fallback={
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
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
