"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Navigation() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

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
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-foreground">
              Nyheder
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/"
                    className={navigationMenuTriggerStyle()}
                  >
                    Alle nyheder
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/investering"
                    className={navigationMenuTriggerStyle()}
                  >
                    Investering
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/byggeri"
                    className={navigationMenuTriggerStyle()}
                  >
                    Byggeri
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            {isPending ? (
              // Loading skeleton - reserve space to prevent layout shift
              <div className="flex items-center gap-4">
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
              </div>
            ) : session?.user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {session.user.name || session.user.email}
                </span>
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
        </div>
      </div>
    </nav>
  );
}
