export type AppTheme =
  | "light"
  | "dark"
  | "gruvbox"
  | "cherry-blossom"
  | "nord"
  | "one-dark"
  | "catppuccin"
  | "cyberpunk"
  | "pride"
  | "high-contrast";

export const THEME_LABELS: Record<AppTheme, string> = {
  light: "Light",
  dark: "Dark",
  gruvbox: "Gruvbox",
  "cherry-blossom": "Cherry Blossom",
  nord: "Nord",
  "one-dark": "One Dark",
  catppuccin: "Catppuccin",
  cyberpunk: "Cyberpunk",
  pride: "Pride",
  "high-contrast": "High Contrast",
};
