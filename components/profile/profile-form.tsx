"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PreferencesForm } from "./preferences-form";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function ProfileForm() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Dine data er blevet opdateret");
      router.refresh();
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Der opstod en fejl ved sletning af konto. Prøv venligst igen.");
      setIsLoading(false);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (!session) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Administrer dine data</CardTitle>
          <CardDescription>
            Se og opdater dine oplysninger, eller slet dem helt fra
            Ejendomsmyt.dk.
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
              {success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="name">Navn</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Opdaterer..." : "Opdater data"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Email Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>E-mail indstillinger</CardTitle>
          <CardDescription>
            Administrer dine nyhedspræferencer og e-mail frekvens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setPreferencesDialogOpen(true)}
          >
            Rediger nyhedspræferencer
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account - More subtle without border */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setDeleteDialogOpen(true)}
        disabled={isLoading}
        className="w-full"
      >
        Slet alle data
      </Button>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slet alle data</DialogTitle>
            <DialogDescription>
              Når du sletter alle data, fjerner vi dine oplysninger fra vores
              systemer i henhold til vores databeskyttelsespolitik.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Annuller
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              {isLoading ? "Sletter..." : "Slet alle data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preferences Dialog */}
      <Dialog
        open={preferencesDialogOpen}
        onOpenChange={setPreferencesDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Definér hvilke nyheder du vil have</DialogTitle>
          </DialogHeader>
          <PreferencesForm onClose={() => setPreferencesDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
