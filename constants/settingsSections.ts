import { SettingsSection } from "@/types/settings";

export const getSettingsSections = (email?: string): SettingsSection[] => [
  {
    title: "Account",
    data: [
      {
        id: "profile",
        title: "User",
        subtitle: email ?? "",
        icon: "person-outline",
      },
    ],
  },
  {
    title: "Preferences",
    data: [
      { id: "language", title: "Language", icon: "language-outline" },
      { id: "theme", title: "Theme", icon: "contrast-outline" },
    ],
  },
  {
    title: "Notifications",
    data: [
      {
        id: "push-notifications",
        title: "Push Notifications",
        icon: "notifications-outline",
      },
    ],
  },
  {
    title: "Security",
    data: [
      {
        id: "change-password",
        title: "Change Password",
        icon: "lock-closed-outline",
      },
      { id: "logout", title: "Log Out", icon: "log-out-outline" },
    ],
  },
];

export const SETTINGS_SECTIONS: SettingsSection[] = getSettingsSections();