"use client";

import { useState } from "react";
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
import { Loader2, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Better Auth forgetPassword method - types may not be fully exported
      const { error: resetError } = await (authClient as typeof authClient & {
        forgetPassword: (params: { email: string; redirectTo: string }) => Promise<{ error: Error | null }>;
      }).forgetPassword({
        email,
        redirectTo: "/nulstil-adgangskode",
      });

      setIsLoading(false);

      if (resetError) {
        setError("Der opstod en fejl. Prøv venligst igen.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setIsLoading(false);
      setError("Der opstod en fejl. Prøv venligst igen.");
    }
  };

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-center">Email sendt!</CardTitle>
            <CardDescription className="text-center">
              Hvis der findes en konto med denne e-mail, har vi sendt et link
              til at nulstille din adgangskode. Tjek din indbakke.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link href="/login" className="text-sm underline">
                Tilbage til login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Glemt adgangskode?</CardTitle>
          <CardDescription>
            Indtast din e-mail, så sender vi dig et link til at nulstille din
            adgangskode.
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
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="navn@firma.dk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
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
                      Sender...
                    </>
                  ) : (
                    "Send nulstillingslink"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Husker du din adgangskode?{" "}
                  <Link href="/login" className="underline">
                    Log ind
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
