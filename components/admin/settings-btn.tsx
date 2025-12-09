import { FolderOpen, Mail, Newspaper, Settings, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsButton() {
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);

  const handleTriggerCron = async () => {
    setIsTriggeringCron(true);

    try {
      const response = await fetch("/api/admin/trigger-cron", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.details || error.error || "Failed to trigger task"
        );
      }

      const data = await response.json();

      toast.success("Nyhedshentning startet!", {
        description:
          "Jobbet kører på Trigger.dev. Nye artikler vil vises når behandlingen er færdig.",
        duration: 5000,
      });

      console.log("Trigger.dev task started:", data.taskId);
      console.log("Monitor at:", data.monitorUrl);

      // Keep button disabled for 5 minutes to prevent duplicate triggers
      setTimeout(() => {
        setIsTriggeringCron(false);
      }, 300000); // 5 minutes
    } catch (error) {
      console.error("Error triggering daily news task:", error);
      toast.error("Kunne ikke starte nyhedshentning", {
        description: error instanceof Error ? error.message : "Ukendt fejl",
      });
      setIsTriggeringCron(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Indstillinger
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Konfiguration</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/admin/categories" className="cursor-pointer">
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Kategorier</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/admin/ai-prompts" className="cursor-pointer">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI Prompts</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/admin/email-templates" className="cursor-pointer">
            <Mail className="mr-2 h-4 w-4" />
            <span>Email Skabeloner</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleTriggerCron}
          disabled={isTriggeringCron}
          className="cursor-pointer"
        >
          <Newspaper className="mr-2 h-4 w-4" />
          <span>
            {isTriggeringCron ? "Job kører..." : "Hent dagens nyheder"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
