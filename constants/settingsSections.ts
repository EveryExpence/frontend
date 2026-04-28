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
        type: "profile",
      },
    ],
  },
  {
    title: "Preferences",
    data: [
      { id: "language", title: "Language", icon: "language-outline", type: "language" },
      { id: "theme", title: "Theme", icon: "contrast-outline", type: "theme" },
    ],
  },
  {
    title: "Notifications",
    data: [
      {
        id: "push-notifications",
        title: "Push Notifications",
        icon: "notifications-outline",
        type: "switch",
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
        type: "password",
      },
      { id: "logout", title: "Log Out", icon: "log-out-outline", type: "logout" },
    ],
  },
];

export const SETTINGS_SECTIONS: SettingsSection[] = getSettingsSections();