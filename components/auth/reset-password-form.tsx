"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("Ugyldig eller manglende nulstillingslink");
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Ugyldig nulstillingslink");
      return;
    }

    if (password.length < 8) {
      setError("Adgangskoden skal være mindst 8 tegn");
      return;
    }

    if (password !== confirmPassword) {
      setError("Adgangskoderne matcher ikke");
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
      });

      setIsLoading(false);

      if (resetError) {
        setError(
          "Kunne ikke nulstille adgangskoden. Linket kan være udløbet."
        );
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      setError("Der opstod en fejl. Prøv venligst igen.");
    }
  };

  if (!token && !error) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Indlæser...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-center">Ugyldig link</CardTitle>
            <CardDescription className="text-center">
              Dette nulstillingslink er ugyldigt eller udløbet. Anmod venligst
              om et nyt link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Link href="/glemt-adgangskode">
                <Button className="w-full">Anmod om nyt link</Button>
              </Link>
              <div className="text-center">
                <Link href="/login" className="text-sm underline">
                  Tilbage til login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-center">
              Adgangskode nulstillet!
            </CardTitle>
            <CardDescription className="text-center">
              Din adgangskode er blevet ændret. Du omdirigeres til login-siden.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Opret ny adgangskode</CardTitle>
          <CardDescription>
            Indtast din nye adgangskode nedenfor. Den skal være mindst 8 tegn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="password">Ny adgangskode</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Bekræft adgangskode
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Nulstiller...
                    </>
                  ) : (
                    "Nulstil adgangskode"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  <Link href="/login" className="underline">
                    Tilbage til login
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
