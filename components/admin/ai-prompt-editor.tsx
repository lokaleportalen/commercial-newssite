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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          toast.error("Kunne ikke indlæse AI prompt");
        }
      } catch (error) {
        console.error("Error fetching AI prompt:", error);
        toast.error("Fejl ved indlæsning af AI prompt");
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

  const handleFieldChange = (
    field: keyof AiPrompt,
    value: string | Date | null
  ) => {
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
        toast.success(data.message || "AI prompt gemt");
        // Refresh versions list
        fetchVersions();
      } else {
        toast.error("Kunne ikke gemme AI prompt");
      }
    } catch (error) {
      console.error("Error saving AI prompt:", error);
      toast.error("Fejl ved gemning af AI prompt");
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
        toast.success(data.message || "Version gendannet");
        // Refresh versions list
        fetchVersions();
      } else {
        toast.error("Kunne ikke gendanne version");
      }
    } catch (error) {
      console.error("Error restoring version:", error);
      toast.error("Fejl ved gendannelse af version");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancel = () => {
    if (prompt) {
      setFormData(prompt);
      setHasChanges(false);
      toast.info("Ændringer annulleret");
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
        AI prompt ikke fundet
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
                Opdateret {new Date(prompt.updatedAt).toLocaleDateString()}
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
                  Versionshistorik
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Versionshistorik</SheetTitle>
                  <SheetDescription>
                    Se og gendan tidligere versioner af denne prompt
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
                      Ingen versionshistorik endnu. Ændringer vil blive
                      arkiveret her når du opdaterer prompten.
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
                                ? "Skjul"
                                : "Vis"}
                            </Button>
                          </div>
                          {selectedVersion?.id === version.id && (
                            <div className="space-y-3 pt-3 border-t">
                              <div>
                                <Label className="text-xs">Prompt Tekst</Label>
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
                                    ? "Gendanner..."
                                    : "Gendan Denne Version"}
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
              {isSaving ? "Gemmer..." : "Gem Ændringer"}
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
          {/* Key (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="key">
              Prompt Nøgle{" "}
              <span className="text-muted-foreground text-xs">
                (skrivebeskyttet)
              </span>
            </Label>
            <Input
              id="key"
              value={formData.key || ""}
              readOnly
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Dette er den unikke identifikator brugt i koden. Kan ikke ændres.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Visningsnavn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="f.eks., Ugentlig Nyhedshentning"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Hvad gør denne prompt?"
              rows={2}
            />
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model">
              AI Model <span className="text-destructive">*</span>
            </Label>
            {formData.key === "article_writing" ? (
              <>
                <Select
                  value={
                    formData.model === "gpt-5-mini"
                      ? "ChatGPT"
                      : formData.model === "gemini-3-pro-exp"
                      ? "Gemini"
                      : formData.model === "claude-haiku-4-5"
                      ? "Claude"
                      : "ChatGPT"
                  }
                  onValueChange={(value) => {
                    const modelMap: Record<string, string> = {
                      ChatGPT: "gpt-5-mini",
                      Gemini: "gemini-3-pro-exp",
                      Claude: "claude-haiku-4-5",
                    };
                    handleFieldChange("model", modelMap[value]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                    <SelectItem value="Gemini">Gemini</SelectItem>
                    <SelectItem value="Claude">Claude</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Vælg AI modellen til artikel-skrivning (ChatGPT: gpt-5-mini,
                  Gemini: gemini-3-pro-exp, Claude: claude-haiku-4-5)
                </p>
              </>
            ) : (
              <>
                <Input
                  id="model"
                  value={formData.model || ""}
                  readOnly
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  AI modellen for denne prompt er fast og kan ikke ændres
                </p>
              </>
            )}
          </div>

          {/* Section */}
          <div className="space-y-2">
            <Label htmlFor="section">
              Sektion <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section"
              value={formData.section || ""}
              onChange={(e) => handleFieldChange("section", e.target.value)}
              placeholder="f.eks., Ugentlige Nyheder, Artikel Generering"
            />
            <p className="text-xs text-muted-foreground">
              Kategori eller sektion denne prompt tilhører
            </p>
          </div>

          {/* Change Description */}
          {hasChanges && (
            <div className="space-y-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <Label htmlFor="changeDescription">
                Ændringsbeskrivelse (Valgfrit)
              </Label>
              <Textarea
                id="changeDescription"
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Beskriv hvad du ændrede og hvorfor..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Denne beskrivelse vil blive gemt med den arkiverede version til
                fremtidig reference
              </p>
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">
              Prompt Tekst <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prompt"
              value={formData.prompt || ""}
              onChange={(e) => handleFieldChange("prompt", e.target.value)}
              placeholder="Indtast AI prompt teksten..."
              rows={25}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {formData.prompt?.length || 0} tegn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
