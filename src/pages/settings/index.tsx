import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, Shield, Bell, Palette, HelpCircle } from "lucide-react";

type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "devices"
  | "appearance"
  | "billing"
  | "help";

import { ProfileSettings } from "@/features/settings/profile-setting";
import { SecuritySettings } from "@/features/settings/security-setting";
import { NotificationSettings } from "@/features/settings/notification-setting";
import { AppearanceSettings } from "@/features/settings/appearance-setting";
import { HelpSupport } from "@/features/settings/help-support";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "security":
        return <SecuritySettings />;
      case "notifications":
        return <NotificationSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "help":
        return <HelpSupport />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {isMobile ? (
          // Mobile: Horizontal tabs
          <div className="w-full space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as SettingsTab)}
            >
              <TabsList className="grid grid-cols-3 mb-4">
                {tabs.slice(0, 3).map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid grid-cols-3 mb-4">
                {tabs.slice(3, 6).map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid grid-cols-1 mb-4">
                {tabs.slice(6).map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {renderTabContent()}
          </div>
        ) : (
          // Desktop: Vertical navigation + content
          <>
            <div className="w-64 shrink-0 bg-card rounded-lg border p-4">
              <h2 className="text-xl font-semibold mb-4">User Settings</h2>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="mr-2 h-5 w-5" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1">{renderTabContent()}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
