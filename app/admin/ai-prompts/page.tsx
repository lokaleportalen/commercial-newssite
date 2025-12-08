"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiPromptList } from "@/components/admin/ai-prompt-list";
import { AiPromptEditor } from "@/components/admin/ai-prompt-editor";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AiPromptsAdminPage() {
  const router = useRouter();
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  return (
    <AdminRoute>
      <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">AI Prompt Administration</h1>
          <p className="text-sm text-muted-foreground">
            Konfigurer AI prompts til artikel-generering og billede-oprettelse
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
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Prompt List */}
        <div className="w-80 border-r bg-muted/30">
          <AiPromptList
            selectedPromptId={selectedPromptId}
            onSelectPrompt={setSelectedPromptId}
          />
        </div>

        {/* Main Content - Prompt Editor */}
        <div className="flex-1 overflow-auto">
          {selectedPromptId ? (
            <AiPromptEditor
              promptId={selectedPromptId}
              onClose={() => setSelectedPromptId(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Vælg en AI prompt at redigere
                </h2>
                <p>Vælg en prompt fra listen for at se og redigere den</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminRoute>
  );
}
