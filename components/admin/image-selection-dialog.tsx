"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalImageUrl: string | null;
  newImageUrl: string;
  onSelect: (selectedImageUrl: string) => void;
  onCancel: () => void;
}

export function ImageSelectionDialog({
  open,
  onOpenChange,
  originalImageUrl,
  newImageUrl,
  onSelect,
  onCancel,
}: ImageSelectionDialogProps) {
  const [selectedImage, setSelectedImage] = useState<"original" | "new" | null>(
    null
  );

  const handleConfirm = () => {
    if (!selectedImage) return;

    const imageUrl =
      selectedImage === "original" ? originalImageUrl || "" : newImageUrl;
    onSelect(imageUrl);
    setSelectedImage(null); // Reset for next time
  };

  const handleCancel = () => {
    setSelectedImage(null);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Vælg billede</DialogTitle>
          <DialogDescription>
            Vælg hvilket billede du vil bruge til artiklen. Det andet billede
            vil blive slettet permanent.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Original Image */}
          <div className="space-y-2">
            <Label>Nuværende billede</Label>
            <button
              type="button"
              onClick={() => setSelectedImage("original")}
              className={cn(
                "relative w-full rounded-lg border-2 transition-all overflow-hidden group",
                selectedImage === "original"
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
            >
              {originalImageUrl ? (
                <img
                  src={originalImageUrl}
                  alt="Nuværende billede"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-muted flex items-center justify-center text-muted-foreground">
                  Intet billede
                </div>
              )}
              {selectedImage === "original" && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* New Image */}
          <div className="space-y-2">
            <Label>Nyt AI-genereret billede</Label>
            <button
              type="button"
              onClick={() => setSelectedImage("new")}
              className={cn(
                "relative w-full rounded-lg border-2 transition-all overflow-hidden group",
                selectedImage === "new"
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
            >
              <img
                src={newImageUrl}
                alt="Nyt billede"
                className="w-full h-64 object-cover"
              />
              {selectedImage === "new" && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Annuller
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedImage}>
            <Check className="mr-2 h-4 w-4" />
            {selectedImage === "original"
              ? "Behold nuværende"
              : selectedImage === "new"
              ? "Brug nyt billede"
              : "Vælg et billede"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
