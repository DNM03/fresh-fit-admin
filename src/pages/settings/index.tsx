import { ProfileSettings } from "@/features/settings/profile-setting";

function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <ProfileSettings />
    </div>
  );
}

export default SettingsPage;
