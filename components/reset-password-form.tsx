"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Adgangskoden skal være mindst 8 tegn");
      return;
    }

    if (password !== confirmPassword) {
      setError("Adgangskoderne matcher ikke");
      return;
    }

    if (!token) {
      setError("Ugyldigt nulstillingslink. Anmod om et nyt link.");
      return;
    }

    setIsLoading(true);

    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Der opstod en fejl. Linket kan være udløbet."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ugyldigt link</CardTitle>
          <CardDescription>
            Dette nulstillingslink er ugyldigt eller mangler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Link er ugyldigt</p>
              <p className="mt-1">
                Anmod om et nyt link til nulstilling af adgangskode.
              </p>
            </div>

            <Link href="/forgot-password">
              <Button className="w-full">Anmod om nyt link</Button>
            </Link>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Tilbage til login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Adgangskode nulstillet!</CardTitle>
          <CardDescription>
            Din adgangskode er blevet nulstillet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">Succes!</p>
              <p className="mt-1">
                Din adgangskode er blevet nulstillet. Du omdirigeres til login...
              </p>
            </div>

            <Link href="/login">
              <Button className="w-full">Gå til login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Nulstil adgangskode</CardTitle>
        <CardDescription>
          Indtast din nye adgangskode nedenfor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel>Ny adgangskode</FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  placeholder="Mindst 8 tegn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Bekræft adgangskode</FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  placeholder="Indtast adgangskode igen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Nulstiller..." : "Nulstil adgangskode"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              ← Tilbage til login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
