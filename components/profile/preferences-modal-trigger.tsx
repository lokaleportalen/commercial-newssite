"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PreferencesForm } from "./preferences-form";

export function PreferencesModalTrigger() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if showPreferences param is present
    if (searchParams.get("showPreferences") === "true") {
      setIsOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove the showPreferences param from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("showPreferences");
    const newUrl = params.toString() ? `?${params.toString()}` : "/";
    router.replace(newUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Definér hvilke nyheder du vil have</DialogTitle>
        </DialogHeader>
        <PreferencesForm onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
