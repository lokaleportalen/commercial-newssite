"use client";

import { useState } from "react";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear field-specific error when user starts typing
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate all fields
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Navn er påkrævet";
    }

    if (!email.trim()) {
      newErrors.email = "E-mail er påkrævet";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Indtast en gyldig e-mailadresse";
    }

    if (!password) {
      newErrors.password = "Adgangskode er påkrævet";
    } else if (password.length < 8) {
      newErrors.password = "Adgangskoden skal være mindst 8 tegn lang";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Bekræft venligst din adgangskode";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Adgangskoderne matcher ikke";
    }

    // If there are validation errors, stop here
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setIsLoading(false);

    if (signUpError) {
      // Check if it's a specific error we can map to a field
      if (signUpError.message?.toLowerCase().includes("email")) {
        setErrors({ email: "Denne e-mailadresse er allerede i brug" });
      } else {
        setErrors({ general: "Der opstod en fejl. Prøv venligst igen." });
      }
      return;
    }

    if (data) {
      router.push("/?showPreferences=true");
      router.refresh();
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Opret en konto</CardTitle>
        <CardDescription>
          Indtast dine oplysninger for at oprette en konto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {errors.general && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errors.general}
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="name">Fulde navn</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Jens Jensen"
                value={name}
                onChange={handleNameChange}
                disabled={isLoading}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <FieldError className="text-xs -mt-2 ml-2">
                  {errors.name}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="navn@firma.dk"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <FieldError className="text-xs -mt-2 ml-2">
                  {errors.email}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Adgangskode</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                aria-invalid={!!errors.password}
              />
              {errors.password ? (
                <FieldError className="text-xs -mt-2 ml-2">
                  {errors.password}
                </FieldError>
              ) : (
                <FieldDescription>
                  Skal være mindst 8 tegn lang.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Bekræft adgangskode
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                disabled={isLoading}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <FieldError className="text-xs -mt-2 ml-2">
                  {errors.confirmPassword}
                </FieldError>
              )}
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Opretter konto..." : "Opret konto"}
              </Button>
              <FieldDescription className="text-center">
                Har du allerede en konto?{" "}
                <Link href="/login" className="underline">
                  Log ind
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
