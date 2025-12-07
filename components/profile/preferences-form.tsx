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

interface PreferencesFormProps {
  onClose?: () => void;
}

export function PreferencesForm({ onClose }: PreferencesFormProps = {}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [newsCategory, setNewsCategory] = useState("all");
  const [emailFrequency, setEmailFrequency] = useState("daily");
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
          if (data.newsCategory) setNewsCategory(data.newsCategory);
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
          newsCategory,
          emailFrequency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      setSuccess("Dine præferencer er blevet gemt");
      // If onClose is provided (dialog mode), close after a short delay
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
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
      // If onClose is provided (dialog mode), close after a short delay
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
            <Label className="text-sm font-medium flex flex-col items-start">
              Nyhedskategorier
              <span className="text-xs font-normal text-muted-foreground">
                Jeg ønsker:
              </span>
            </Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="newsCategory"
                  value="all"
                  checked={newsCategory === "all"}
                  onChange={(e) => setNewsCategory(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">Alle nyheder</span>
              </label>

              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="newsCategory"
                  value="investment"
                  checked={newsCategory === "investment"}
                  onChange={(e) => setNewsCategory(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">Investeringsnyheder</span>
              </label>

              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="newsCategory"
                  value="construction"
                  checked={newsCategory === "construction"}
                  onChange={(e) => setNewsCategory(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">Bygudvikling</span>
              </label>

              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="newsCategory"
                  value="new"
                  checked={newsCategory === "new"}
                  onChange={(e) => setNewsCategory(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">D nyt</span>
              </label>

              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50">
                <input
                  type="radio"
                  name="newsCategory"
                  value="old"
                  checked={newsCategory === "old"}
                  onChange={(e) => setNewsCategory(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">E nyt</span>
              </label>
            </div>
          </div>

          {/* Email Frequency */}
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
                  value="daily"
                  checked={emailFrequency === "daily"}
                  onChange={(e) => setEmailFrequency(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">
                  Send mig relevante nyheder 1 gang om dagen
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSaving} className="w-full">
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
    </div>
  );
}
