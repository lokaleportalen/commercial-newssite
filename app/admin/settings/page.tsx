"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

type AIProvider = "openai" | "gemini" | "claude";

const AI_PROVIDERS = [
  {
    value: "openai" as const,
    label: "OpenAI (ChatGPT)",
    description: "GPT-4o. Balanced performance for article writing and metadata generation. (Also used for research with web search)",
  },
  {
    value: "gemini" as const,
    label: "Google Gemini",
    description: "Gemini 3 Pro. Fast and efficient for article writing. Great for concise, structured content.",
  },
  {
    value: "claude" as const,
    label: "Anthropic Claude",
    description: "Claude Sonnet 4. Excellent for nuanced, detailed, and high-quality article writing.",
  },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("openai");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchCurrentProvider() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/settings/ai-provider");
        if (response.ok) {
          const data = await response.json();
          setSelectedProvider(data.provider);
        } else {
          toast.error("Kunne ikke indlæse AI provider indstilling");
        }
      } catch (error) {
        console.error("Error fetching AI provider:", error);
        toast.error("Fejl ved indlæsning af AI provider");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentProvider();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/settings/ai-provider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider }),
      });

      if (response.ok) {
        toast.success("AI provider opdateret", {
          description: `Artikler vil nu genereres med ${AI_PROVIDERS.find(p => p.value === selectedProvider)?.label}`,
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Kunne ikke opdatere AI provider");
      }
    } catch (error) {
      console.error("Error saving AI provider:", error);
      toast.error("Fejl ved gem af AI provider");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminRoute>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background px-6 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">System Indstillinger</h1>
            <p className="text-sm text-muted-foreground">
              Konfigurer AI provider og andre systemindstillinger
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbage til Dashboard
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Provider</CardTitle>
                <CardDescription>
                  Vælg hvilken AI model der skal bruges til <strong>artikel-skrivning og metadata-generering</strong>.
                  Research med web-søgning bruger altid OpenAI (kun OpenAI har web-søgning).
                  Ændringer træder i kraft ved næste artikel-generering.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <RadioGroup
                      value={selectedProvider}
                      onValueChange={(value) => setSelectedProvider(value as AIProvider)}
                      className="space-y-4"
                    >
                      {AI_PROVIDERS.map((provider) => (
                        <div
                          key={provider.value}
                          className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent transition-colors"
                        >
                          <RadioGroupItem value={provider.value} id={provider.value} className="mt-1" />
                          <div className="flex-1">
                            <Label
                              htmlFor={provider.value}
                              className="text-base font-semibold cursor-pointer"
                            >
                              {provider.label}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {provider.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gemmer...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Gem indstillinger
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">API Keys</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Note:</strong> API keys skal konfigureres via miljøvariabler (.env fil):
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><code className="text-xs bg-muted px-1 py-0.5 rounded">OPENAI_API_KEY</code> - For OpenAI ChatGPT</li>
                  <li><code className="text-xs bg-muted px-1 py-0.5 rounded">GEMINI_API_KEY</code> - For Google Gemini</li>
                  <li><code className="text-xs bg-muted px-1 py-0.5 rounded">ANTHROPIC_API_KEY</code> - For Anthropic Claude</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
