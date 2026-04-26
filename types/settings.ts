export type SettingItemType =
  | "profile"
  | "language"
  | "theme"
  | "switch"
  | "password"
  | "logout";

export type Language = "eng" | "pl";

export type AppTheme = "light" | "dark";

export type SettingItem = {
  id: string;
  title: string;
  icon: string;
  type: SettingItemType;
  subtitle?: string;
};

export type SettingsSection = {
  title: string;
  data: SettingItem[];
};