"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { ClientSessionData } from "@/types/auth";
import type { Category } from "@/types";

interface MobileNavigationProps {
  session: ClientSessionData | null;
  isPending: boolean;
  categories: Category[];
  handleSignOut: () => void;
  setSearchOpen: (open: boolean) => void;
}

export function MobileNavigation({
  session,
  isPending,
  categories,
  handleSignOut,
  setSearchOpen,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoriesDrawerOpen, setCategoriesDrawerOpen] = useState(false);

  const handleSignOutAndClose = async () => {
    await handleSignOut();
    setDrawerOpen(false);
  };

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Åbn menu"
        >
          <Menu className="h-7 w-7" />
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
              <X className="h-6 w-6" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
          {/* Search at the top */}
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

          <Separator className="my-4" />

          {/* Main navigation */}
          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className={cn(
              "rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/"
                ? "bg-accent text-accent-foreground"
                : "text-foreground"
            )}
          >
            Forside
          </Link>

          <Link
            href="/nyheder"
            onClick={() => setDrawerOpen(false)}
            className={cn(
              "rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/nyheder"
                ? "bg-accent text-accent-foreground"
                : "text-foreground"
            )}
          >
            Nyheder
          </Link>

          {/* Nested Categories Drawer */}
          <Drawer
            open={categoriesDrawerOpen}
            onOpenChange={setCategoriesDrawerOpen}
            direction="right"
            nested
          >
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="justify-start rounded-md p-0 px-4 py-3 text-sm font-medium"
              >
                Kategorier
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="flex flex-col">
              <DrawerHeader className="relative">
                <DrawerTitle>Kategorier</DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    aria-label="Luk kategorier"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </DrawerClose>
              </DrawerHeader>
              <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${category.slug}`}
                    onClick={() => {
                      setCategoriesDrawerOpen(false);
                      setDrawerOpen(false);
                    }}
                    className={cn(
                      "rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === `/${category.slug}`
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground"
                    )}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </DrawerContent>
          </Drawer>

          <Link
            href="/om-os"
            onClick={() => setDrawerOpen(false)}
            className={cn(
              "rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/om-os"
                ? "bg-accent text-accent-foreground"
                : "text-foreground"
            )}
          >
            Om os
          </Link>

          <Separator className="my-4" />

          <div className="mt-auto flex flex-col gap-2">
            {isPending ? (
              <div className="flex flex-col gap-2">
                <div className="h-11 animate-pulse rounded-md bg-muted" />
                <div className="h-11 animate-pulse rounded-md bg-muted" />
              </div>
            ) : session?.user ? (
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/profile" onClick={() => setDrawerOpen(false)}>
                    Profil
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOutAndClose}
                  className="justify-start"
                >
                  Log ud
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="justify-start py-6">
                  <Link href="/login" onClick={() => setDrawerOpen(false)}>
                    Log ind
                  </Link>
                </Button>
                <Button asChild className="justify-start py-6">
                  <Link href="/signup" onClick={() => setDrawerOpen(false)}>
                    Opret konto
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
