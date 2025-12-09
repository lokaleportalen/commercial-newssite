"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmailTemplateList } from "@/components/admin/email-template-list";
import { EmailTemplateEditor } from "@/components/admin/email-template-editor";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SettingsButton from "@/components/admin/settings-btn";

export default function EmailTemplatesAdminPage() {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  return (
    <AdminRoute>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background px-6 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">
              Email Template Administration
            </h1>
            <p className="text-sm text-muted-foreground">
              Administrer email-skabeloner og tilpas indhold
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbage til Dashboard
            </Button>
            <SettingsButton />
          </div>
        </div>
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Template List */}
          <div className="w-80 border-r bg-muted/30">
            <EmailTemplateList
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
            />
          </div>

          {/* Main Content - Template Editor */}
          <div className="flex-1 overflow-auto">
            {selectedTemplateId ? (
              <EmailTemplateEditor
                templateId={selectedTemplateId}
                onClose={() => setSelectedTemplateId(null)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">
                    Vælg en email-skabelon at redigere
                  </h2>
                  <p>Vælg en skabelon fra listen for at se og redigere den</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
