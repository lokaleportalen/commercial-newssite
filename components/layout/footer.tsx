import Link from "next/link";
import { db } from "@/database/db";
import { category } from "@/database/schema";
import { desc } from "drizzle-orm";

export async function Footer() {
  // Fetch categories for footer
  const categories = await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })
    .from(category)
    .orderBy(category.name);

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Om</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/om-os"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Om os
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Kategorier</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length > 6 && (
                <li>
                  <Link
                    href="/nyheder"
                    className="text-sm text-primary hover:underline"
                  >
                    Se alle kategorier →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Nyhedsbrev</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Få de seneste nyheder direkte i din indbakke
            </p>
            <Link
              href="/signup"
              className="text-sm text-primary hover:underline"
            >
              Tilmeld dig her
            </Link>
          </div>

          {/* Follow Us Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Følg os</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.facebook.com/lokaleportalen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/lokaleportalen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Estatenews.dk - En del af{" "}
            <a
              href="https://www.lokaleportalen.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Lokaleportalen.dk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
