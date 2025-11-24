import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";

function ResetPasswordContent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-muted-foreground">Indlæser...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
