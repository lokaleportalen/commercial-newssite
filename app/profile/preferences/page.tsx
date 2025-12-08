import { PreferencesForm } from "@/components/profile/preferences-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PreferencesPage() {
  return (
    <ProtectedRoute>
      <div className="container max-w-2xl py-8 mx-auto">
        <PreferencesForm />
      </div>
    </ProtectedRoute>
  );
}
