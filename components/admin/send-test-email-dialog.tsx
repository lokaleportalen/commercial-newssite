"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SendTestEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (recipientEmail: string) => Promise<void>;
  isSending: boolean;
}

export function SendTestEmailDialog({
  open,
  onOpenChange,
  onSend,
  isSending,
}: SendTestEmailDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    const trimmedEmail = recipientEmail.trim();

    // Validate email
    if (!trimmedEmail) {
      setEmailError("Email er påkrævet");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Indtast en gyldig email adresse");
      return;
    }

    setEmailError("");
    await onSend(trimmedEmail);

    setRecipientEmail("");
  };

  const handleCancel = () => {
    setRecipientEmail("");
    setEmailError("");
    onOpenChange(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientEmail(e.target.value);
    if (emailError) {
      setEmailError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send test email</DialogTitle>
          <DialogDescription>
            Indtast en email adresse for at modtage en test email med
            placeholder indhold. Emnelinjen vil være prefixed med [TEST].
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-email">
              Modtager email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="test@example.com"
              value={recipientEmail}
              onChange={handleEmailChange}
              disabled={isSending}
              className={emailError ? "border-destructive" : ""}
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Test emailen vil indeholde standard variabler og placeholder tekst
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSending}>
            Annuller
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sender...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send test email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
