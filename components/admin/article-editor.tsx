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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { MoreVertical, Upload, X, Archive, Trash2 } from "lucide-react";
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
  categories: Category[] | string | null;
  status: string;
  publishedDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

type ArticleEditorProps = {
  articleId: string;
  onClose: () => void;
};

export function ArticleEditor({ articleId, onClose }: ArticleEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categoriesDisplay, setCategoriesDisplay] = useState("");
  const [sourcesDisplay, setSourcesDisplay] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to convert categories to display string
  const categoriesToString = (
    categories: Category[] | string | null
  ): string => {
    if (!categories) return "";
    if (typeof categories === "string") return categories;
    if (Array.isArray(categories)) {
      return categories.map((cat) => cat.name).join(", ");
    }
    return "";
  };

  // Fetch article data
  useEffect(() => {
    async function fetchArticle() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/articles/${articleId}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data.article);
          setFormData(data.article);
          setCategoriesDisplay(categoriesToString(data.article.categories));
          setSourcesDisplay(
            Array.isArray(data.article.sources)
              ? data.article.sources.join('\n')
              : ''
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCategoriesChange = (value: string) => {
    setCategoriesDisplay(value);
    // Store as string in formData - the API will handle the conversion
    handleFieldChange("categories", value);
  };

  const handleSourcesChange = (value: string) => {
    setSourcesDisplay(value);
    // Convert newline-separated string to array
    const sourcesArray = value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
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
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
        setFormData(data.article);
        setCategoriesDisplay(categoriesToString(data.article.categories));
        setHasChanges(false);
        toast.success("Article saved successfully");
      } else {
        toast.error("Failed to save article");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Error saving article");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (article) {
      setFormData(article);
      setCategoriesDisplay(categoriesToString(article.categories));
      setSourcesDisplay(
        Array.isArray(article.sources)
          ? article.sources.join('\n')
          : ''
      );
      setHasChanges(false);
      toast.info("Changes cancelled");
    }
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "archived" }),
      });

      if (response.ok) {
        toast.success("Article archived successfully");
        onClose();
        router.refresh();
      } else {
        toast.error("Failed to archive article");
      }
    } catch (error) {
      console.error("Error archiving article:", error);
      toast.error("Error archiving article");
    }
    setShowArchiveDialog(false);
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
      case "archived":
        return "secondary";
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
                {formData.status === "published"
                  ? "Published"
                  : formData.status === "archived"
                  ? "Archived"
                  : "Draft"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Updated {new Date(article.updatedAt).toLocaleDateString()}
              </span>
            </div>
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
                disabled={formData.status === "archived"}
              />
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug || ""}
              onChange={(e) => handleFieldChange("slug", e.target.value)}
              placeholder="article-url-slug"
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
            <Label htmlFor="categories">Categories</Label>
            <Input
              id="categories"
              value={categoriesDisplay}
              onChange={(e) => handleCategoriesChange(e.target.value)}
              placeholder="Comma-separated categories"
            />
            <p className="text-xs text-muted-foreground">
              Enter category names separated by commas (e.g., Tech, News,
              Sports)
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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

      {/* Archive Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the article and hide it from public view. You
              can restore it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
