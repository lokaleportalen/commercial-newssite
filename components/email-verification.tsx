"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function EmailVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Ugyldigt verificeringslink");
      return;
    }

    const verifyEmail = async () => {
      try {
        await authClient.verifyEmail({
          token,
        });

        setStatus("success");

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Verificering mislykkedes. Linket kan være udløbet."
        );
      }
    };

    verifyEmail();
  }, [token, router]);

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verificerer e-mail
          </CardTitle>
          <CardDescription>
            Vent venligst mens vi verificerer din e-mailadresse...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Verificering mislykkedes
          </CardTitle>
          <CardDescription>
            Der opstod et problem med at verificere din e-mail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Fejl</p>
              <p className="mt-1">{error}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={async () => {
                  try {
                    const session = await authClient.getSession();
                    if (session.data?.user?.email) {
                      await authClient.sendVerificationEmail({
                        email: session.data.user.email,
                        callbackURL: "/verify-email",
                      });
                      alert("Verificerings e-mail sendt!");
                    }
                  } catch (err) {
                    alert("Kunne ikke sende e-mail. Prøv venligst at logge ind først.");
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Send verificerings e-mail igen
              </Button>

              <Link href="/">
                <Button className="w-full">Gå til forsiden</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          E-mail verificeret!
        </CardTitle>
        <CardDescription>
          Din e-mailadresse er blevet verificeret
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-medium">Succes!</p>
            <p className="mt-1">
              Din e-mailadresse er nu verificeret. Du kan nu få adgang til alle
              funktioner. Du omdirigeres til forsiden...
            </p>
          </div>

          <Link href="/">
            <Button className="w-full">Gå til forsiden</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
