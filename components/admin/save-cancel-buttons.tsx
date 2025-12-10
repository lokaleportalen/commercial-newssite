import { Button } from "@/components/ui/button";

interface SaveCancelButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  saveLabel?: string;
  savingLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export function SaveCancelButtons({
  onSave,
  onCancel,
  isSaving,
  hasChanges,
  saveLabel = "Gem",
  savingLabel = "Gemmer...",
  cancelLabel = "Annuller",
  className = "",
}: SaveCancelButtonsProps) {
  if (!hasChanges) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? savingLabel : saveLabel}
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={isSaving}>
        {cancelLabel}
      </Button>
    </div>
  );
}
