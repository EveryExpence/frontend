import type { ReactNode } from "react";

export type Language = "eng" | "pl";

export type AppTheme = "light" | "dark";

export type SettingItem = {
  id: string;
  title: string;
  icon: string;
  subtitle?: string;
  onPress?: () => void;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  titleTone?: "default" | "danger";
  iconTone?: "default" | "danger";
};

export type SettingsSection = {
  title: string;
  data: SettingItem[];
};