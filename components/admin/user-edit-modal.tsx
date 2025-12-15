"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, AlertCircle, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { User, UserPreferences, Category } from "@/types";

interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserUpdated: () => void;
  onBack?: () => void;
}

export function UserEditModal({
  open,
  onOpenChange,
  user,
  onUserUpdated,
  onBack,
}: UserEditModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailFrequency, setEmailFrequency] = useState<"immediate" | "weekly" | "none">(
    "weekly"
  );
  const [allCategories, setAllCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load categories and user preferences on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Load categories
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok)
          throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);

        // Load user preferences
        const prefsResponse = await fetch(
          `/api/profile/preferences?userId=${user.id}`
        );
        if (prefsResponse.ok) {
          const prefsData = await prefsResponse.json();
          setUserPreferences(prefsData.preferences);
          setEmailFrequency(prefsData.preferences.emailFrequency || "weekly");
          setAllCategories(prefsData.preferences.allCategories ?? true);
          setSelectedCategories(
            prefsData.preferences.categories?.map((c: Category) => c.id) || []
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Fejl", {
          description: "Kunne ikke hente brugerdata",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      loadData();
    }
  }, [open, user]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          emailFrequency,
          allCategories,
          categoryIds: selectedCategories,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast.success("Bruger opdateret", {
        description: "Brugeroplysninger er blevet gemt",
      });

      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Fejl", {
        description: "Kunne ikke opdatere bruger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("Bruger slettet", {
        description: "Brugeren er blevet slettet permanent",
      });

      onUserUpdated();
      onOpenChange(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Fejl", {
        description:
          error instanceof Error ? error.message : "Kunne ikke slette bruger",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>Rediger bruger</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2">
                Navn
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Brugerens navn"
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Brugerens email"
              />
            </div>

            <div>
              <Label htmlFor="emailFrequency" className="mb-2">
                Email frekvens
              </Label>
              <Select
                value={emailFrequency}
                onValueChange={(value) =>
                  setEmailFrequency(value as "immediate" | "weekly" | "none")
                }
              >
                <SelectTrigger id="emailFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Straks</SelectItem>
                  <SelectItem value="weekly">Ugentlig</SelectItem>
                  <SelectItem value="none">Ingen emails</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Kategoripræferencer</Label>
            <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto p-3 border rounded-md bg-muted/20">
              {categories.map((category) => (
                <div key={category.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-tight cursor-pointer select-none"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Section */}
          <div className="border-t pt-6">
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-fit"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slet bruger
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">
                      Er du sikker?
                    </p>
                    <p className="text-muted-foreground">
                      Denne handling kan ikke fortrydes. Alle brugerdata vil
                      blive slettet permanent.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Annuller
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sletter...
                      </>
                    ) : (
                      "Bekræft sletning"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuller
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gemmer...
              </>
            ) : (
              "Gem ændringer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
