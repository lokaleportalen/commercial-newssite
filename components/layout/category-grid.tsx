"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Briefcase,
  Store,
  Warehouse,
  ShoppingBag,
  Truck,
  Hotel as HotelIcon,
  Factory,
  Home,
  Leaf
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  investering: <Briefcase className="h-6 w-6" />,
  byggeri: <Building2 className="h-6 w-6" />,
  kontor: <Building2 className="h-6 w-6" />,
  lager: <Warehouse className="h-6 w-6" />,
  detailhandel: <Store className="h-6 w-6" />,
  logistik: <Truck className="h-6 w-6" />,
  hotel: <HotelIcon className="h-6 w-6" />,
  industri: <Factory className="h-6 w-6" />,
  bolig: <Home className="h-6 w-6" />,
  baeredygtighed: <Leaf className="h-6 w-6" />,
};

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <h2 className="text-2xl font-bold mb-6">Gennemse kategorier</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 max-w-6xl">
      <h2 className="text-2xl font-bold mb-6">Gennemse kategorier</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/${category.slug}`}>
            <Card className="h-full p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="text-primary group-hover:scale-110 transition-transform">
                  {categoryIcons[category.slug] || <Building2 className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {category.articleCount} {category.articleCount === 1 ? "artikel" : "artikler"}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
