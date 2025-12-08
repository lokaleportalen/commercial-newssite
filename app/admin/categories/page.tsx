"use client";

import { useState, useEffect } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroImage: string | null;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState<string | null>(null);

  // Helper function to generate URL-friendly slug from name
  const generateSlug = (name: string): string => {
    return (
      name
        .toLowerCase()
        .trim()
        // Replace Danish characters
        .replace(/æ/g, "ae")
        .replace(/ø/g, "oe")
        .replace(/å/g, "aa")
        // Replace spaces and special chars with hyphens
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        // Remove multiple consecutive hyphens
        .replace(/-+/g, "-")
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, "")
    );
  };


  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name);
      setDescription(selectedCategory.description || "");
      setHeroImage(selectedCategory.heroImage);
      setPreviewImage(selectedCategory.heroImage);
    } else if (isCreating) {
      // Clear form for new category
      setName("");
      setDescription("");
      setHeroImage(null);
      setPreviewImage(null);
    }
  }, [selectedCategory, isCreating]);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setName("");
    setDescription("");
    setHeroImage(null);
    setPreviewImage(null);
  };

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(categoryToDelete.id);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: categoryToDelete.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully");

      // If deleted category was selected, clear selection
      if (selectedCategory?.id === categoryToDelete.id) {
        setSelectedCategory(null);
        setIsCreating(false);
      }

      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    } finally {
      setIsDeleting(null);
      setCategoryToDelete(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Upload via API route (server-side)
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-category-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();

      setHeroImage(data.url);
      setPreviewImage(data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setHeroImage(null);
    setPreviewImage(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    // Auto-generate slug from name
    const slug = generateSlug(name);

    setIsSaving(true);

    try {
      if (isCreating) {
        // Create new category
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            description,
            heroImage,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create category");
        }

        const data = await response.json();
        toast.success("Category created successfully");
        await loadCategories();

        // Switch to the newly created category
        setIsCreating(false);
        setSelectedCategory(data.category);
      } else if (selectedCategory) {
        // Update existing category
        const response = await fetch("/api/admin/categories", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedCategory.id,
            name,
            slug,
            description,
            heroImage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update category");
        }

        toast.success("Category updated successfully");
        await loadCategories();

        // Update selected category
        setSelectedCategory({
          ...selectedCategory,
          name,
          slug,
          description,
          heroImage,
        });
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save category"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background px-6 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">Category Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage category hero images and details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" onClick={handleCreateCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add category
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "/admin")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Category List */}
          <div className="w-80 border-r bg-muted/30 overflow-auto">
            <div className="p-4">
              <h2 className="font-semibold mb-3">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`group relative rounded-lg border transition-colors ${
                      selectedCategory?.id === category.id && !isCreating
                        ? "border-primary bg-background"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsCreating(false);
                      }}
                      className="w-full text-left p-3 pr-10"
                    >
                      <div className="font-medium">{category.name}</div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(category.id, category.name);
                      }}
                      disabled={isDeleting === category.id}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      aria-label="Delete category"
                    >
                      {isDeleting === category.id ? (
                        <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Category Editor */}
          <div className="flex-1 overflow-auto p-6">
            {selectedCategory || isCreating ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {isCreating ? "Create New Category" : selectedCategory?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isCreating
                      ? "Fill in the details for the new category"
                      : "Edit category details and manage hero image"}
                  </p>
                </div>

                <Card className="p-6">
                  <div className="space-y-6">
                    {/* Category Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Category Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Category name"
                      />
                      <p className="text-xs text-muted-foreground">
                        Slug will be auto-generated from the name
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Category description"
                        rows={3}
                      />
                    </div>

                    {/* Hero Image */}
                    <div className="space-y-2">
                      <Label>Hero Image</Label>

                      {previewImage ? (
                        <div
                          className="relative aspect-[3/1] w-full rounded-lg overflow-hidden border group cursor-pointer"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          <Image
                            src={previewImage}
                            alt="Hero preview"
                            fill
                            className="object-cover"
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-center">
                              <Upload className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">
                                Click to change image
                              </p>
                            </div>
                          </div>
                          {/* Remove button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage();
                            }}
                            className="absolute top-2 right-2 p-2 bg-accent text-accent-foreground rounded-full hover:text-primary z-10 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          {isUploading ? (
                            <div className="space-y-3">
                              <div className="h-12 w-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                              <p className="text-sm text-muted-foreground">
                                Uploading...
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                              <p className="text-sm font-medium mb-1">
                                Click to upload hero image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Recommended: 1920x600px (3:1 ratio). Max 5MB.
                              </p>
                            </>
                          )}
                        </div>
                      )}

                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        JPG, PNG, or WebP formats supported
                      </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2 pt-4">
                      {isCreating && (
                        <Button
                          variant="outline"
                          onClick={handleCancelCreate}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving
                          ? "Saving..."
                          : isCreating
                            ? "Create Category"
                            : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">
                    Select a category to edit
                  </h2>
                  <p>Choose a category from the list to manage its details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!categoryToDelete}
          onOpenChange={(open) => !open && setCategoryToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{categoryToDelete?.name}
                &quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminRoute>
  );
}
