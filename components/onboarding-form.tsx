"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function OnboardingForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [newsCategory, setNewsCategory] = useState("all");
  const [emailFrequency, setEmailFrequency] = useState("daily");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

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

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <Card {...props}>
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

            {/* News Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Nyhedskategorier
                <span className="ml-1 text-xs font-normal text-muted-foreground">
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
              <Label className="text-sm font-medium">
                Hyppighed for nyheder
              </Label>
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
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Gemmer..." : "Bekræft"}
            </Button>

            {/* Skip link */}
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-center text-sm text-muted-foreground hover:underline"
            >
              Du kan altid ændrede nyheder hurtigt og slet.
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
