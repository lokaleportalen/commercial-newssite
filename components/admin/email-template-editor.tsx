"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Save, RotateCcw, Mail } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendTestEmailDialog } from "@/components/admin/send-test-email-dialog";

type EmailTemplate = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  subject: string;
  previewText: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type EmailTemplateEditorProps = {
  templateId: string;
  onClose: () => void;
};

export function EmailTemplateEditor({
  templateId,
  onClose,
}: EmailTemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({});
  const [contentFields, setContentFields] = useState<Record<string, string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Fetch template data
  useEffect(() => {
    async function fetchTemplate() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/email-templates/${templateId}`
        );
        if (response.ok) {
          const data = await response.json();
          setTemplate(data.template);
          setFormData(data.template);

          // Parse content JSON into fields
          try {
            const parsedContent = JSON.parse(data.template.content);
            setContentFields(parsedContent);
          } catch (e) {
            console.error("Error parsing content:", e);
            toast.error("Kunne ikke parse skabelon indhold");
          }

          setHasChanges(false);
        } else {
          toast.error("Kunne ikke indlæse email-skabelon");
        }
      } catch (error) {
        console.error("Error fetching email template:", error);
        toast.error("Fejl ved indlæsning af email-skabelon");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplate();
  }, [templateId]);

  // Load preview when opening preview panel
  useEffect(() => {
    if (showPreview && templateId) {
      loadPreview();
    }
  }, [showPreview, templateId]);

  const loadPreview = async () => {
    try {
      setIsLoadingPreview(true);
      const response = await fetch(
        `/api/admin/email-templates/${templateId}/preview?format=html`
      );
      if (response.ok) {
        const html = await response.text();
        setPreviewHtml(html);
      } else {
        toast.error("Kunne ikke indlæse forhåndsvisning");
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      toast.error("Fejl ved indlæsning af forhåndsvisning");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleFieldChange = (field: keyof EmailTemplate, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleContentFieldChange = (field: string, value: string) => {
    setContentFields((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Ingen ændringer at gemme");
      return;
    }

    try {
      setIsSaving(true);

      // Build updated content JSON
      const updatedContent = JSON.stringify(contentFields);

      const response = await fetch(
        `/api/admin/email-templates/${templateId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            content: updatedContent,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplate(data.template);
        setFormData(data.template);
        setHasChanges(false);
        toast.success("Email-skabelon gemt");

        // Reload preview if it's open
        if (showPreview) {
          loadPreview();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Kunne ikke gemme email-skabelon");
      }
    } catch (error) {
      console.error("Error saving email template:", error);
      toast.error("Fejl ved gemning af email-skabelon");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (template) {
      setFormData(template);
      try {
        const parsedContent = JSON.parse(template.content);
        setContentFields(parsedContent);
      } catch (e) {
        console.error("Error parsing content:", e);
      }
      setHasChanges(false);
      toast.info("Ændringer annulleret");
    }
  };

  const handleSendTestEmail = async (recipientEmail: string) => {
    try {
      setIsSendingTest(true);

      const response = await fetch(
        `/api/admin/email-templates/${templateId}/send-test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientEmail }),
        }
      );

      if (response.ok) {
        toast.success(`Test email sendt til ${recipientEmail}`);
        setShowTestEmailDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Kunne ikke sende test email");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Fejl ved afsendelse af test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Email-skabelon ikke fundet
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Editor Panel */}
      <div className={showPreview ? "w-1/2 border-r" : "w-full"}>
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{template.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? "Skjul" : "Vis"} Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTestEmailDialog(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!hasChanges || isSaving}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Annuller
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Gemmer..." : "Gem"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Basic Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grundlæggende</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Email emne</Label>
                  <Input
                    id="subject"
                    value={formData.subject || ""}
                    onChange={(e) =>
                      handleFieldChange("subject", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previewText">Preview tekst</Label>
                  <Input
                    id="previewText"
                    value={formData.previewText || ""}
                    onChange={(e) =>
                      handleFieldChange("previewText", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Vises i email-klienten før emailen åbnes
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Skabelon aktiv</Label>
                    <p className="text-xs text-muted-foreground">
                      Kun aktive skabeloner bruges til at sende emails
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) =>
                      handleFieldChange("isActive", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email indhold</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(contentFields).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    {value && value.length > 100 ? (
                      <Textarea
                        id={key}
                        value={value}
                        onChange={(e) =>
                          handleContentFieldChange(key, e.target.value)
                        }
                        rows={4}
                      />
                    ) : (
                      <Input
                        id={key}
                        value={value}
                        onChange={(e) =>
                          handleContentFieldChange(key, e.target.value)
                        }
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {key.includes("Cta") && "Tekst på knappen"}
                      {key.includes("heading") && "Overskrift"}
                      {key.includes("greeting") && "Hilsen (brug {userName} for brugernavn)"}
                      {key.includes("Paragraph") && "Brødtekst"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="w-1/2 bg-muted/20">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Email forhåndsvisning</h3>
              <p className="text-xs text-muted-foreground">
                Sådan vil emailen se ud for brugerne
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Indlæser...</div>
                </div>
              ) : (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  title="Email preview"
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Test Email Dialog */}
      <SendTestEmailDialog
        open={showTestEmailDialog}
        onOpenChange={setShowTestEmailDialog}
        onSend={handleSendTestEmail}
        isSending={isSendingTest}
      />
    </div>
  );
}
