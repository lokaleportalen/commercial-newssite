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
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SaveCancelButtons } from "@/components/admin/save-cancel-buttons";
import { Upload, X, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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
  const sourcesTextareaRef = useRef<HTMLTextAreaElement>(null);

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
          toast.error("Kunne ikke indlæse artikel");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast.error("Fejl ved indlæsning af artikel");
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

  // Auto-resize sources textarea to fit content
  useEffect(() => {
    const textarea = sourcesTextareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set height to scrollHeight to fit all content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [sourcesDisplay]);

  const handleFieldChange = (
    field: keyof Article,
    value: string | string[] | Date | Category[] | null
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-generate slug from title
      if (field === "title" && typeof value === "string") {
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
        toast.success("Billede uploadet");
      } else {
        toast.error("Kunne ikke uploade billede");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Fejl ved upload af billede");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!formData.title || !formData.content) {
        toast.error("Titel og indhold er påkrævet");
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
        toast.success(isNewArticle ? "Artikel oprettet" : "Artikel gemt");

        // If this was a new article, notify parent component
        if (isNewArticle && data.article.id) {
          onArticleCreated?.(data.article.id);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Kunne ikke gemme artikel");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Fejl ved gemning af artikel");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (articleId === "new") {
      // Close the editor for new unsaved articles
      onClose();
      toast.info("Artikeloprettelse annulleret");
    } else if (article) {
      setFormData(article);
      setSourcesDisplay(
        Array.isArray(article.sources) ? article.sources.join("\n") : ""
      );
      setHasChanges(false);
      toast.info("Ændringer annulleret");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Artikel slettet");
        onClose();
        router.refresh();
      } else {
        toast.error("Kunne ikke slette artikel");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Fejl ved sletning af artikel");
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
        Artikel ikke fundet
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
                {formData.status === "published" ? "Publiceret" : "Kladde"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Opdateret {new Date(article.updatedAt).toLocaleDateString()}
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
                  {typeof window !== "undefined" ? window.location.origin : ""}
                  /nyheder/
                  <span className="font-medium">{formData.slug}</span>
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Publish/Unpublish Toggle */}
            <div className="flex items-center gap-2 mr-4">
              <Label htmlFor="publish-toggle" className="text-sm">
                {formData.status === "published" ? "Publiceret" : "Publicer"}
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
        <SaveCancelButtons
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
          hasChanges={hasChanges}
          className="pt-2 border-t"
        />
      </div>

      {/* Editor Form */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="Artikeltitel"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Label htmlFor="summary">Resumé</Label>
              <Popover>
                <PopoverTrigger>
                  <Info className="h-4 w-4" />
                </PopoverTrigger>
                <PopoverContent className="text-sm">
                  Bruges til preview af artikler og i e-mails.{" "}
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              id="summary"
              value={formData.summary || ""}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              placeholder="Kort artikel resumé (2-3 sætninger)"
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Indhold *</Label>
            <RichTextEditor
              value={formData.content || ""}
              onChange={(markdown) => handleFieldChange("content", markdown)}
              placeholder="Skriv dit artikelindhold her..."
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Beskrivelse</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription || ""}
              onChange={(e) =>
                handleFieldChange("metaDescription", e.target.value)
              }
              placeholder="SEO meta beskrivelse (150-160 tegn)"
              rows={2}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {formData.metaDescription?.length || 0}/160 tegn
            </p>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Fremhævet Billede</Label>
            <div className="space-y-2">
              <Input
                id="image"
                value={formData.image || ""}
                onChange={(e) => handleFieldChange("image", e.target.value)}
                placeholder="Billede URL eller upload nedenfor"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploader..." : "Upload Billede"}
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
                  alt="Forhåndsvisning"
                  className="w-full max-w-md rounded-lg border"
                />
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label htmlFor="categories">Kategorier (maks 3)</Label>
            <CategorySelect
              selectedCategories={formData.categories || []}
              onCategoriesChange={handleCategoriesChange}
              maxCategories={3}
            />
            <p className="text-xs text-muted-foreground">
              Søg og vælg op til 3 kategorier til denne artikel
            </p>
          </div>

          {/* Sources */}
          <div className="space-y-2">
            <Label htmlFor="sources">Kilder</Label>
            <Textarea
              ref={sourcesTextareaRef}
              id="sources"
              value={sourcesDisplay}
              onChange={(e) => handleSourcesChange(e.target.value)}
              placeholder="Indtast kilde-URL'er, én pr. linje"
              rows={2}
              className="resize-none overflow-hidden"
            />
            <p className="text-xs text-muted-foreground">
              Indtast hver kilde-URL på en ny linje
            </p>
          </div>

          {/* Save/Cancel Buttons at Bottom */}
          <SaveCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            hasChanges={hasChanges}
            className="pt-4 border-t"
          />
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slet Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil permanent slette artiklen. Denne handling kan ikke
              fortrydes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Slet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
