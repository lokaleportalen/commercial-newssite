"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RegenerateImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (customDescription?: string) => Promise<void>;
  isGenerating: boolean;
}

export function RegenerateImageDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
}: RegenerateImageDialogProps) {
  const [customDescription, setCustomDescription] = useState("");

  const handleGenerate = async () => {
    await onGenerate(customDescription.trim() || undefined);
    setCustomDescription(""); // Reset for next time
  };

  const handleCancel = () => {
    setCustomDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generer nyt billede</DialogTitle>
          <DialogDescription>
            Dette vil generere et nyt AI-genereret billede til artiklen. Du kan
            vælge mellem det nye og nuværende billede bagefter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="custom-description">
              Tilpasset beskrivelse (valgfrit)
            </Label>
            <Textarea
              id="custom-description"
              placeholder="F.eks. 'vis en moderne kontorbygning i København', 'inkluder mennesker i billedet', etc."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={4}
              disabled={isGenerating}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Lad feltet være tomt for at bruge standard AI-prompt baseret på
              artikelens overskrift
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isGenerating}
          >
            Annuller
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Genererer...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generer billede
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
