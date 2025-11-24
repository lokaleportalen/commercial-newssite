"use client";

import { useState } from "react";
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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Der opstod en fejl. Prøv venligst igen."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tjek din e-mail</CardTitle>
          <CardDescription>
            Vi har sendt et link til nulstilling af adgangskode til {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-medium">E-mail sendt!</p>
            <p className="mt-1">
              Klik på linket i e-mailen for at nulstille din adgangskode. Linket
              udløber om 1 time.
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Ikke modtaget e-mailen?{" "}
            <button
              onClick={() => setSuccess(false)}
              className="text-primary hover:underline"
            >
              Send igen
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Tilbage til login
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Glemt adgangskode?</CardTitle>
        <CardDescription>
          Indtast din e-mailadresse, så sender vi dig et link til at nulstille din
          adgangskode
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
              <FieldLabel>E-mailadresse</FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  placeholder="din@email.dk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sender..." : "Send nulstillingslink"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Husk din adgangskode?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log ind
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
