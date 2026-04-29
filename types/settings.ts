import type { ReactNode } from "react";

export type ThemeColors = (typeof import("@/constants/theme").Colors)[keyof typeof import("@/constants/theme").Colors];
export type Language = "eng" | "pl";
export type AppTheme = "light" | "dark";

export type SettingsItemBase = {
	id: string;
	title: string;
	iconName?: string;
	tone?: "danger";
};

export type SettingsSectionBase = {
	title: string;
	items: SettingsItemBase[];
};

export type SettingsRowProps = {
	title: string;
	subtitle?: string;
	iconName?: string;
	leftElement?: ReactNode;
	rightElement?: ReactNode;
	tone?: "danger";
	onPress?: () => void;
	colors: ThemeColors;
};

export type SettingsItem = {
	id: string;
	title: string;
	subtitle?: string;
	iconName?: string;
	leftElement?: ReactNode;
	rightElement?: ReactNode;
	tone?: "danger";
	onPress?: () => void;
};

export type SettingsSection = {
	title: string;
	items: SettingsItem[];
};
