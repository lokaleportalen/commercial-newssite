"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Alle nyheder" },
  { href: "/investering", label: "Investering" },
  { href: "/byggeri", label: "Byggeri" },
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const { isAdmin } = useUserRole();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-foreground">
              Nyheder
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      href={item.href}
                      className={navigationMenuTriggerStyle()}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
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
                <Separator orientation="vertical" className="h-6" />
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
              <div className="flex flex-col gap-2 p-4 h-full">
                {/* Navigation Links */}
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground"
                    )}
                  >
                    {item.label}
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
