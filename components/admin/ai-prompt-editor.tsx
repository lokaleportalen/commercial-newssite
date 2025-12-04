"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { X, History, RotateCcw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

type AiPrompt = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  model: string;
  section: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
};

type AiPromptVersion = {
  id: string;
  promptId: string;
  name: string;
  description: string | null;
  model: string;
  section: string;
  prompt: string;
  versionNumber: string;
  changeDescription: string | null;
  createdAt: Date;
};

type AiPromptEditorProps = {
  promptId: string;
  onClose: () => void;
};

export function AiPromptEditor({ promptId, onClose }: AiPromptEditorProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<AiPrompt | null>(null);
  const [formData, setFormData] = useState<Partial<AiPrompt>>({});
  const [changeDescription, setChangeDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [versions, setVersions] = useState<AiPromptVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<AiPromptVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch prompt data
  useEffect(() => {
    async function fetchPrompt() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/ai-prompts/${promptId}`);
        if (response.ok) {
          const data = await response.json();
          setPrompt(data.prompt);
          setFormData(data.prompt);
          setHasChanges(false);
        } else {
          toast.error("Failed to load AI prompt");
        }
      } catch (error) {
        console.error("Error fetching AI prompt:", error);
        toast.error("Error loading AI prompt");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrompt();
  }, [promptId]);

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

  const handleFieldChange = (field: keyof AiPrompt, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const fetchVersions = async () => {
    try {
      setIsLoadingVersions(true);
      const response = await fetch(
        `/api/admin/ai-prompts/${promptId}/versions`
      );
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions);
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/ai-prompts/${promptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, changeDescription }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrompt(data.prompt);
        setFormData(data.prompt);
        setHasChanges(false);
        setChangeDescription("");
        toast.success(data.message || "AI prompt saved successfully");
        // Refresh versions list
        fetchVersions();
      } else {
        toast.error("Failed to save AI prompt");
      }
    } catch (error) {
      console.error("Error saving AI prompt:", error);
      toast.error("Error saving AI prompt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      setIsRestoring(true);
      const response = await fetch(
        `/api/admin/ai-prompts/${promptId}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPrompt(data.prompt);
        setFormData(data.prompt);
        setHasChanges(false);
        setSelectedVersion(null);
        toast.success(data.message || "Version restored successfully");
        // Refresh versions list
        fetchVersions();
      } else {
        toast.error("Failed to restore version");
      }
    } catch (error) {
      console.error("Error restoring version:", error);
      toast.error("Error restoring version");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancel = () => {
    if (prompt) {
      setFormData(prompt);
      setHasChanges(false);
      toast.info("Changes cancelled");
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

  if (!prompt) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        AI prompt not found
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
              <Badge variant="outline">{formData.section}</Badge>
              <span className="text-sm text-muted-foreground">
                Updated {new Date(prompt.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{formData.name}</h2>
            {formData.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {formData.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" onClick={fetchVersions}>
                  <History className="mr-2 h-4 w-4" />
                  Version History
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Version History</SheetTitle>
                  <SheetDescription>
                    View and restore previous versions of this prompt
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                  {isLoadingVersions ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No version history yet. Changes will be archived here when
                      you update the prompt.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  v{version.versionNumber}
                                </Badge>
                                <Badge variant="outline">{version.model}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(version.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="font-semibold mt-2">
                                {version.name}
                              </h4>
                              {version.changeDescription && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {version.changeDescription}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                selectedVersion?.id === version.id
                                  ? setSelectedVersion(null)
                                  : setSelectedVersion(version)
                              }
                            >
                              {selectedVersion?.id === version.id
                                ? "Hide"
                                : "View"}
                            </Button>
                          </div>
                          {selectedVersion?.id === version.id && (
                            <div className="space-y-3 pt-3 border-t">
                              <div>
                                <Label className="text-xs">Prompt Text</Label>
                                <div className="mt-1 p-3 bg-muted rounded-md text-sm font-mono max-h-64 overflow-auto">
                                  {version.prompt}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    handleRestoreVersion(version.id)
                                  }
                                  disabled={isRestoring}
                                >
                                  <RotateCcw className="mr-2 h-3 w-3" />
                                  {isRestoring
                                    ? "Restoring..."
                                    : "Restore This Version"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {hasChanges && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Key (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="key">
              Prompt Key{" "}
              <span className="text-muted-foreground text-xs">(read-only)</span>
            </Label>
            <Input
              id="key"
              value={formData.key || ""}
              readOnly
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              This is the unique identifier used in code. Cannot be changed.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="e.g., Weekly News Fetch"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="What does this prompt do?"
              rows={2}
            />
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model">
              AI Model <span className="text-destructive">*</span>
            </Label>
            <Input
              id="model"
              value={formData.model || ""}
              onChange={(e) => handleFieldChange("model", e.target.value)}
              placeholder="e.g., gpt-4o, gemini-3-pro"
            />
            <p className="text-xs text-muted-foreground">
              The AI model used for this prompt (e.g., gpt-4o, gpt-5-mini,
              gemini-3-pro-image-preview)
            </p>
          </div>

          {/* Section */}
          <div className="space-y-2">
            <Label htmlFor="section">
              Section <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section"
              value={formData.section || ""}
              onChange={(e) => handleFieldChange("section", e.target.value)}
              placeholder="e.g., Weekly News, Article Generation"
            />
            <p className="text-xs text-muted-foreground">
              Category or section this prompt belongs to
            </p>
          </div>

          {/* Change Description */}
          {hasChanges && (
            <div className="space-y-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <Label htmlFor="changeDescription">
                Change Description (Optional)
              </Label>
              <Textarea
                id="changeDescription"
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Describe what you changed and why..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                This description will be saved with the archived version for
                future reference
              </p>
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">
              Prompt Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prompt"
              value={formData.prompt || ""}
              onChange={(e) => handleFieldChange("prompt", e.target.value)}
              placeholder="Enter the AI prompt text..."
              rows={25}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {formData.prompt?.length || 0} characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">Usage Information</h3>
            <p className="text-sm text-muted-foreground">
              This prompt is used in the application code via the key "
              <code className="bg-background px-1 py-0.5 rounded">
                {formData.key}
              </code>
              ". Changes will take effect immediately after saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
