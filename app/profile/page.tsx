import { ProfileForm } from "@/components/profile/profile-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container max-w-2xl py-8 mx-auto">
        <ProfileForm />
      </div>
    </ProtectedRoute>
  );
}
