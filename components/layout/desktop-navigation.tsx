"use client";

import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ClientSessionData } from "@/types/auth";
import type { Category } from "@/types";

interface DesktopNavigationProps {
  session: ClientSessionData | null;
  isPending: boolean;
  categories: Category[];
  handleSignOut: () => void;
  setSearchOpen: (open: boolean) => void;
}

export function DesktopNavigation({
  session,
  isPending,
  categories,
  handleSignOut,
  setSearchOpen,
}: DesktopNavigationProps) {
  return (
    <>
      <div className="hidden md:flex items-center gap-1">
        <Link
          href="/"
          className={cn(navigationMenuTriggerStyle(), "hover:bg-transparent")}
        >
          Forside
        </Link>

        <Link
          href="/nyheder"
          className={cn(navigationMenuTriggerStyle(), "hover:bg-transparent")}
        >
          Nyheder
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild suppressHydrationWarning>
            <Button
              variant="ghost"
              className="hover:bg-transparent h-9 px-4 py-2 text-sm font-medium"
              suppressHydrationWarning
              onMouseEnter={(e) => {
                const trigger = e.currentTarget;
                trigger.click();
              }}
            >
              Kategorier
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[300px]"
            onMouseLeave={(e) => {
              const content = e.currentTarget;
              const trigger = content.previousElementSibling as HTMLElement;
              if (trigger) {
                trigger.click();
              }
            }}
          >
            <div className="grid grid-cols-2 gap-1 p-2">
              {categories.map((category) => (
                <DropdownMenuItem key={category.id} asChild>
                  <Link href={`/${category.slug}`} className="cursor-pointer">
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/om-os"
          className={cn(navigationMenuTriggerStyle(), "hover:bg-transparent")}
        >
          Om os
        </Link>
      </div>

      <div className="hidden ml-auto justify-self-end md:flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          aria-label="Søg"
        >
          <Search className="h-5 w-5" />
        </Button>
        {isPending ? (
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
    </>
  );
}
