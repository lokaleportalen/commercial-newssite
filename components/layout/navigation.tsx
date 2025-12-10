"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SearchDialog } from "@/components/layout/search-dialog";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
}

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Handle scroll for sticky navigation shadow
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
          setDrawerOpen(false);
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
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2 text-primary"
            >
              Estate News
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={cn(
                  navigationMenuTriggerStyle(),
                  "hover:bg-transparent"
                )}
              >
                Alle nyheder
              </Link>

              <Link
                href="/om-os"
                className={cn(
                  navigationMenuTriggerStyle(),
                  "hover:bg-transparent"
                )}
              >
                Om os
              </Link>

              {/* Kategorier Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild suppressHydrationWarning>
                  <Button
                    variant="ghost"
                    className="hover:bg-transparent h-9 px-4 py-2 text-sm font-medium"
                    suppressHydrationWarning
                  >
                    Kategorier
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[300px]">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {categories.map((category) => (
                      <DropdownMenuItem key={category.id} asChild>
                        <Link
                          href={`/${category.slug}`}
                          className="cursor-pointer"
                        >
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Search and Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Søg"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            {isPending ? (
              // Loading skeleton - reserve space to prevent layout shift
              <div className="flex items-center gap-4">
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
              </div>
            ) : session?.user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/profile">Profil</Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  Log ud
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log ind</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Opret konto</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Burger Menu */}
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            direction="right"
          >
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Åbn menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="flex flex-col">
              <DrawerHeader className="relative">
                <DrawerTitle>Menu</DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    aria-label="Luk menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </DrawerHeader>
              <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
                {/* Alle nyheder Link */}
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/"
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground"
                  )}
                >
                  Alle nyheder
                </Link>

                {/* Om os Link */}
                <Link
                  href="/om-os"
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/om-os"
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground"
                  )}
                >
                  Om os
                </Link>

                <Separator className="my-2" />

                {/* Categories Section */}
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Kategorier
                  </p>
                </div>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${category.slug}`}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === `/${category.slug}`
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.articleCount}
                      </span>
                    </div>
                  </Link>
                ))}

                <Separator className="my-2" />

                {/* Search Button */}
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    setDrawerOpen(false);
                    setSearchOpen(true);
                  }}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Søg
                </Button>

                <Separator className="my-2" />

                {/* Auth Buttons */}
                <div className="mt-auto flex flex-col">
                  {isPending ? (
                    <div className="flex flex-col gap-2">
                      <div className="h-11 animate-pulse rounded-md bg-muted" />
                      <div className="h-11 animate-pulse rounded-md bg-muted" />
                    </div>
                  ) : session?.user ? (
                    <>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link
                          href="/profile"
                          onClick={() => setDrawerOpen(false)}
                        >
                          Profil
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="justify-start"
                      >
                        Log ud
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link
                          href="/login"
                          onClick={() => setDrawerOpen(false)}
                        >
                          Log ind
                        </Link>
                      </Button>
                      <Button asChild className="justify-start">
                        <Link
                          href="/signup"
                          onClick={() => setDrawerOpen(false)}
                        >
                          Opret konto
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
}
