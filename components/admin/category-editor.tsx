"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryEditorProps = {
  categoryId: string | null;
  onClose: () => void;
};

export function CategoryEditor({ categoryId, onClose }: CategoryEditorProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isNewCategory = categoryId === "new";

  // Fetch category data if editing existing
  useEffect(() => {
    async function fetchCategory() {
      if (!categoryId || categoryId === "new") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/categories/${categoryId}`);
        if (response.ok) {
          const data = await response.json();
          setCategory(data.category);
          setFormData(data.category);
          setHasChanges(false);
        } else {
          toast.error("Failed to load category");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        toast.error("Error loading category");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategory();
  }, [categoryId]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleFieldChange = (field: keyof Category, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);

    // Auto-generate slug from name if editing name and this is a new category
    if (field === "name" && isNewCategory) {
      const slug = value
        .toLowerCase()
        .replace(/[æ]/g, "ae")
        .replace(/[ø]/g, "oe")
        .replace(/[å]/g, "aa")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSave = async () => {
    // Validate
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      setIsSaving(true);

      if (isNewCategory) {
        // Create new category
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success("Category created successfully");
          setHasChanges(false);
          // Refresh the category list
          if ((window as any).refreshCategories) {
            await (window as any).refreshCategories();
          }
          onClose();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to create category");
        }
      } else {
        // Update existing category
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          setCategory(data.category);
          setFormData(data.category);
          setHasChanges(false);
          toast.success("Category updated successfully");
          // Refresh the category list
          if ((window as any).refreshCategories) {
            await (window as any).refreshCategories();
          }
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to update category");
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Error saving category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isNewCategory) {
      setFormData({ name: "", slug: "", description: "" });
      setHasChanges(false);
    } else if (category) {
      setFormData(category);
      setHasChanges(false);
    }
    toast.info("Changes cancelled");
  };

  const handleDelete = async () => {
    if (isNewCategory) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted successfully");
        // Refresh the category list
        if ((window as any).refreshCategories) {
          await (window as any).refreshCategories();
        }
        onClose();
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
    }
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              {isNewCategory ? "New Category" : "Edit Category"}
            </h2>
            {!isNewCategory && category && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(category.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isNewCategory && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {hasChanges && (
          <div className="flex items-center gap-2 pt-4 border-t mt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : isNewCategory ? "Create" : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Editor Form */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="e.g., Butik & Retail"
            />
            <p className="text-xs text-muted-foreground">
              The display name shown to users
            </p>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug || ""}
              onChange={(e) => handleFieldChange("slug", e.target.value)}
              placeholder="e.g., butik-retail"
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier (lowercase, no spaces)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Brief description of this category"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional description for SEO and metadata
            </p>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. Articles using this
              category will not be affected, but the category will be removed
              from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
