"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Available categories matching the database seed
const CATEGORIES = [
  { slug: "investering", name: "Investering", description: "Investeringer, salg og finansielle transaktioner" },
  { slug: "byggeri", name: "Byggeri", description: "Byggeprojekter, udvikling og nybyggeri" },
  { slug: "kontor", name: "Kontor", description: "Kontorlokaler og kontorejendomme" },
  { slug: "lager", name: "Lager", description: "Lagerfaciliteter og lagerejendomme" },
  { slug: "detailhandel", name: "Detailhandel", description: "Butikslokaler og detailhandelsejendomme" },
  { slug: "logistik", name: "Logistik", description: "Logistikcentre og distributionsfaciliteter" },
  { slug: "hotel", name: "Hotel", description: "Hotelejendomme og turismefaciliteter" },
  { slug: "industri", name: "Industri", description: "Industriejendomme og produktionsfaciliteter" },
  { slug: "bolig", name: "Bolig", description: "Boligejendomme og udlejningsejendomme" },
  { slug: "baeredygtighed", name: "Bæredygtighed", description: "Grønne tiltag og energieffektivisering" },
] as const;

export function PreferencesForm() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [newsCategories, setNewsCategories] = useState<string[]>([]);
  const [emailFrequency, setEmailFrequency] = useState("ugentligt");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const data = await response.json();
          if (data.newsCategories && Array.isArray(data.newsCategories)) {
            setNewsCategories(data.newsCategories);
          }
          if (data.emailFrequency) setEmailFrequency(data.emailFrequency);
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newsCategories,
          emailFrequency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      setSuccess("Dine præferencer er blevet gemt");
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (categorySlug: string) => {
    setNewsCategories((prev) => {
      if (prev.includes(categorySlug)) {
        return prev.filter((slug) => slug !== categorySlug);
      } else {
        return [...prev, categorySlug];
      }
    });
  };

  const handleUnsubscribe = async () => {
    if (!confirm("Er du sikker på, at du vil afmelde alle nyhedsmails?")) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/user/preferences/unsubscribe", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to unsubscribe");
      }

      setSuccess("Du er nu afmeldt alle nyhedsmails");
      router.push("/profile");
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Du skal være logget ind for at ændre dine præferencer.
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">Log ind</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Indlæser...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Definér hvilke nyheder du vil have</CardTitle>
          <CardDescription>
            Vælg typer af nyheder og hvor ofte du vil have dem sendt på mail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* News Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Nyhedskategorier
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Vælg de kategorier du er interesseret i (vælg ingen for alle nyheder)
                  </span>
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CATEGORIES.map((category) => (
                    <label
                      key={category.slug}
                      className="flex cursor-pointer items-start space-x-3 rounded-lg border p-3 hover:bg-accent/50"
                    >
                      <input
                        type="checkbox"
                        checked={newsCategories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email Frequency */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Hyppighed for nyheder
                </Label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value="straks"
                      checked={emailFrequency === "straks"}
                      onChange={(e) => setEmailFrequency(e.target.value)}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">
                      Straks - Send mig en mail hver gang der er en relevant nyhed
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value="ugentligt"
                      checked={emailFrequency === "ugentligt"}
                      onChange={(e) => setEmailFrequency(e.target.value)}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">
                      Ugentligt - Ugentligt nyhedsbrev (onsdage kl. 9:00)
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value="aldrig"
                      checked={emailFrequency === "aldrig"}
                      onChange={(e) => setEmailFrequency(e.target.value)}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">
                      Aldrig - Ingen emails (jeg læser nyheder på sitet)
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? "Gemmer..." : "Bekræft"}
              </Button>

              {/* Unsubscribe link */}
              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={isSaving}
                className="w-full text-center text-sm text-muted-foreground hover:underline"
              >
                Afmeld alle mails
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Back to Profile */}
      <div className="text-center">
        <Button asChild variant="outline">
          <Link href="/profile">Tilbage til profil</Link>
        </Button>
      </div>
    </div>
  );
}
