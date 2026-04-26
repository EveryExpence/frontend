import { SettingsSection } from "@/types/settings";

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: "Account",
    data: [
      {
        id: "profile",
        title: "Kowalus",
        subtitle: "ananas@edu.p.lodz.pl",
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