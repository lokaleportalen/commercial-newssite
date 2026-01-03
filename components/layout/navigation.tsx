"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type { ClientSessionData } from "@/types/auth";
import { SearchDialog } from "@/components/layout/search-dialog";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function Navigation() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession() as {
    data: ClientSessionData | null;
    isPending: boolean;
  };
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <nav
      suppressHydrationWarning
      className={cn(
        "sticky top-0 z-50 border-b bg-background transition-shadow",
        isScrolled && "shadow-md"
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between w-full">
          <div className="flex items-center gap-8 w-full">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2 text-primary"
            >
              Estatenews.dk
            </Link>

            <DesktopNavigation
              session={session}
              isPending={isPending}
              categories={categories}
              handleSignOut={handleSignOut}
              setSearchOpen={setSearchOpen}
            />
          </div>

          <MobileNavigation
            session={session}
            isPending={isPending}
            categories={categories}
            handleSignOut={handleSignOut}
            setSearchOpen={setSearchOpen}
          />
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
}
