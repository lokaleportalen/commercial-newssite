import { getPayload } from 'payload'
import config from '@payload-config'
import { HeroBanner } from "@/components/hero-banner";
import { HeroSection } from "@/components/hero-section";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";

const HERO_ARTICLES_COUNT = 4;

const ARTICLES_PER_PAGE = 15;

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const payload = await getPayload({ config })

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const isFirstPage = currentPage === 1;

  // Fetch all published articles
  const { docs: allArticles, totalDocs } = await payload.find({
    collection: 'articles',
    where: {
      _status: {
        equals: 'published',
      },
    },
    sort: '-publishedDate',
    limit: 100, // Get enough for hero + grid
  })

  // Split articles for hero and grid display
  const heroArticles = isFirstPage ? allArticles.slice(0, HERO_ARTICLES_COUNT) : []
  const startIndex = isFirstPage ? HERO_ARTICLES_COUNT : (currentPage - 1) * ARTICLES_PER_PAGE + HERO_ARTICLES_COUNT
  const gridArticles = allArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE)

  const totalCount = totalDocs
  const gridArticlesCount = Math.max(0, totalCount - HERO_ARTICLES_COUNT);
  const totalPages = Math.ceil(gridArticlesCount / ARTICLES_PER_PAGE);

  const hasContent = heroArticles.length > 0 || gridArticles.length > 0;

  return (
    <div className="flex-1">
      <HeroBanner />

      {isFirstPage && heroArticles.length > 0 && (
        <HeroSection articles={heroArticles as any} />
      )}

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {!hasContent ? (
          <section className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Ingen artikler fundet
            </p>
          </section>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-8">Seneste Nyt</h2>

            {gridArticles.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((articleItem: any) => (
                  <ArticleCard
                    key={articleItem.id}
                    title={articleItem.title}
                    slug={articleItem.slug}
                    summary={articleItem.summary || ''}
                    image={articleItem.featuredImage?.url || null}
                    publishedDate={articleItem.publishedDate}
                    categories={articleItem.categories?.map((cat: any) => cat.name).join(', ') || ''}
                  />
                ))}
              </section>
            )}

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
