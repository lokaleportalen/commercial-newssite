import { Suspense } from "react";
import { EmailVerification } from "@/components/email-verification";

function VerifyEmailContent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <EmailVerification />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-muted-foreground">Indlæser...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
