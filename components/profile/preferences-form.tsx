"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category } from "@/types";
import type { ClientSessionData } from "@/types/auth";

interface PreferencesFormProps {
  onClose?: () => void;
}

export function PreferencesForm({ onClose }: PreferencesFormProps = {}) {
  const router = useRouter();
  const { data: session } = authClient.useSession() as { data: ClientSessionData | null };
  const [allCategories, setAllCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [emailFrequency, setEmailFrequency] = useState("weekly");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!session?.user) return;

      try {
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }

        const preferencesResponse = await fetch("/api/user/preferences");
        if (preferencesResponse.ok) {
          const data = await preferencesResponse.json();
          setAllCategories(data.allCategories ?? true);
          setSelectedCategories(data.selectedCategories || []);
          setEmailFrequency(data.emailFrequency || "weekly");
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
          allCategories,
          selectedCategories: allCategories ? [] : selectedCategories,
          emailFrequency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save preferences");
      }

      setSuccess("Dine præferencer er blevet gemt");
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Der opstod en fejl. Prøv venligst igen."
      );
    } finally {
      setIsSaving(false);
    }
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
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        router.push("/profile");
      }
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Indlæser...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

          <div className="space-y-3">
            <Label className="text-sm font-medium flex flex-col items-start">
              Nyhedskategorier
              <span className="text-xs font-normal text-muted-foreground">
                Jeg ønsker:
              </span>
            </Label>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="categorySelection"
                  checked={allCategories}
                  onChange={() => setAllCategories(true)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm font-medium">Alle Nyheder</span>
              </label>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                  <input
                    type="radio"
                    name="categorySelection"
                    checked={!allCategories}
                    onChange={() => setAllCategories(false)}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm font-medium">
                    Vælg specifikke kategorier
                  </span>
                </label>

                {!allCategories && (
                  <div className="ml-7 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-2 cursor-pointer rounded-md border p-3 hover:bg-accent/50"
                      >
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() =>
                            handleCategoryToggle(category.id)
                          }
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Hyppighed for nyheder</Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="emailFrequency"
                  value="immediate"
                  checked={emailFrequency === "immediate"}
                  onChange={(e) => setEmailFrequency(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">
                  Send mig en mail hver gang der er en relevant nyhed
                </span>
              </label>

              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="emailFrequency"
                  value="weekly"
                  checked={emailFrequency === "weekly"}
                  onChange={(e) => setEmailFrequency(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">
                  Send mig relevante nyheder 1 gang om ugen
                </span>
              </label>

              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="emailFrequency"
                  value="none"
                  checked={emailFrequency === "none"}
                  onChange={(e) => setEmailFrequency(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">
                  Ingen emails (afmeldt)
                </span>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? "Gemmer..." : "Bekræft"}
          </Button>

          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={isSaving}
            className="w-full text-center text-sm text-muted-foreground flex justify-self-center max-w-fit cursor-pointer hover:underline"
          >
            Afmeld alle mails
          </button>
        </div>
      </form>
    </div>
  );
}
