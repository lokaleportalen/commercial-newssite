"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { CategorySelect } from "@/components/admin/category-select";
import { Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  metaDescription: string | null;
  image: string | null;
  sources: string[] | null;
  categories: Category[];
  status: string;
  publishedDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

type ArticleEditorProps = {
  articleId: string;
  onClose: () => void;
  onArticleCreated?: (articleId: string) => void;
};

export function ArticleEditor({
  articleId,
  onClose,
  onArticleCreated,
}: ArticleEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sourcesDisplay, setSourcesDisplay] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to generate URL-friendly slug from title
  const generateSlug = (title: string): string => {
    return (
      title
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

  // Fetch article data
  useEffect(() => {
    async function fetchArticle() {
      // Handle new article creation (not saved to DB yet)
      if (articleId === "new") {
        const newArticle: Article = {
          id: "new",
          title: "",
          slug: "",
          content: "",
          summary: null,
          metaDescription: null,
          image: null,
          sources: null,
          categories: [],
          status: "draft",
          publishedDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setArticle(newArticle);
        setFormData(newArticle);
        setSourcesDisplay("");
        setHasChanges(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/articles/${articleId}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data.article);
          setFormData(data.article);
          setSourcesDisplay(
            Array.isArray(data.article.sources)
              ? data.article.sources.join("\n")
              : ""
          );
          setHasChanges(false);
        } else {
          toast.error("Failed to load article");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast.error("Error loading article");
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [articleId]);

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

  const handleFieldChange = (field: keyof Article, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-generate slug from title
      if (field === "title") {
        newData.slug = generateSlug(value);
      }

      return newData;
    });
    setHasChanges(true);
  };

  const handleCategoriesChange = (categories: Category[]) => {
    handleFieldChange("categories", categories);
  };

  const handleSourcesChange = (value: string) => {
    setSourcesDisplay(value);
    // Convert newline-separated string to array
    const sourcesArray = value
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleFieldChange("sources", sourcesArray);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          body: file,
        }
      );

      if (response.ok) {
        const data = await response.json();
        handleFieldChange("image", data.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!formData.title || !formData.content) {
        toast.error("Title and content are required");
        setIsSaving(false);
        return;
      }

      const isNewArticle = articleId === "new";
      const url = isNewArticle
        ? "/api/admin/articles"
        : `/api/admin/articles/${articleId}`;
      const method = isNewArticle ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categories: formData.categories?.map((c) => c.id) || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
        setFormData(data.article);
        setSourcesDisplay(
          Array.isArray(data.article.sources)
            ? data.article.sources.join("\n")
            : ""
        );
        setHasChanges(false);
        toast.success(
          isNewArticle
            ? "Article created successfully"
            : "Article saved successfully"
        );

        // If this was a new article, notify parent component
        if (isNewArticle && data.article.id) {
          onArticleCreated?.(data.article.id);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save article");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Error saving article");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (articleId === "new") {
      // Close the editor for new unsaved articles
      onClose();
      toast.info("Article creation cancelled");
    } else if (article) {
      setFormData(article);
      setSourcesDisplay(
        Array.isArray(article.sources) ? article.sources.join("\n") : ""
      );
      setHasChanges(false);
      toast.info("Changes cancelled");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Article deleted successfully");
        onClose();
        router.refresh();
      } else {
        toast.error("Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Error deleting article");
    }
    setShowDeleteDialog(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      default:
        return "warning";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Article not found
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getStatusVariant(formData.status!)}>
                {formData.status === "published" ? "Published" : "Draft"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Updated {new Date(article.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {formData.slug && (
              <div className="text-sm text-muted-foreground">
                <a
                  href={`/nyheder/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-foreground transition-colors"
                >
                  {typeof window !== "undefined" ? window.location.origin : ""}/nyheder/
                  <span className="font-medium">{formData.slug}</span>
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Publish/Unpublish Toggle */}
            <div className="flex items-center gap-2 mr-4">
              <Label htmlFor="publish-toggle" className="text-sm">
                {formData.status === "published" ? "Published" : "Publish"}
              </Label>
              <Switch
                id="publish-toggle"
                checked={formData.status === "published"}
                onCheckedChange={(checked) =>
                  handleFieldChange("status", checked ? "published" : "draft")
                }
              />
            </div>

            {/* Delete button - Only show for existing articles */}
            {articleId !== "new" && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Gemmer..." : "Gem"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Annuller
            </Button>
          </div>
        )}
      </div>

      {/* Editor Form */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="Article title"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary || ""}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              placeholder="Brief article summary (2-3 sentences)"
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content || ""}
              onChange={(e) => handleFieldChange("content", e.target.value)}
              placeholder="Article content in markdown"
              rows={20}
              className="font-mono text-sm"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription || ""}
              onChange={(e) =>
                handleFieldChange("metaDescription", e.target.value)
              }
              placeholder="SEO meta description (150-160 characters)"
              rows={2}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {formData.metaDescription?.length || 0}/160 characters
            </p>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Featured Image</Label>
            <div className="space-y-2">
              <Input
                id="image"
                value={formData.image || ""}
                onChange={(e) => handleFieldChange("image", e.target.value)}
                placeholder="Image URL or upload below"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full max-w-md rounded-lg border"
                />
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label htmlFor="categories">Categories (max 3)</Label>
            <CategorySelect
              selectedCategories={formData.categories || []}
              onCategoriesChange={handleCategoriesChange}
              maxCategories={3}
            />
            <p className="text-xs text-muted-foreground">
              Search and select up to 3 categories for this article
            </p>
          </div>

          {/* Sources */}
          <div className="space-y-2">
            <Label htmlFor="sources">Sources</Label>
            <Textarea
              id="sources"
              value={sourcesDisplay}
              onChange={(e) => handleSourcesChange(e.target.value)}
              placeholder="Enter source URLs, one per line"
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Enter each source URL on a new line
            </p>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the article. This action cannot be
              undone.
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
