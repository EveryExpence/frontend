import { Platform } from "react-native";
import type { AppTheme } from "@/types/theme";

/* ─── Theme palette shape ─── */
export type ThemePalette = {
  text: string;
  background: string;
  tint: string;
  surface: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  textLight: string;
  textDark: string;
  error: string;
  warning: string;
  success: string;
};

/* ─── Existing Light & Dark ─── */

const tintColorLight = "#4370C7";
const tintColorDark = "#8AB4F8";

/* ─── Custom Theme Palettes ─── */

const gruvbox: ThemePalette = {
  text: "#ebdbb2",
  background: "#282828",
  tint: "#d79921",
  surface: "#3c3836",
  icon: "#a89984",
  tabIconDefault: "#a89984",
  tabIconSelected: "#d79921",
  textLight: "#fbf1c7",
  textDark: "#1d2021",
  error: "#cc241d",
  warning: "#fabd2f",
  success: "#98971a",
};

const cherryBlossom: ThemePalette = {
  text: "#f5e6f0",
  background: "#1a1a2e",
  tint: "#ff6b9d",
  surface: "#2d1f3d",
  icon: "#c4a0c3",
  tabIconDefault: "#c4a0c3",
  tabIconSelected: "#ff6b9d",
  textLight: "#ffeaf4",
  textDark: "#1a0a1e",
  error: "#e63946",
  warning: "#ffd166",
  success: "#06d6a0",
};

const nord: ThemePalette = {
  text: "#eceff4",
  background: "#2e3440",
  tint: "#88c0d0",
  surface: "#3b4252",
  icon: "#81a1c1",
  tabIconDefault: "#81a1c1",
  tabIconSelected: "#88c0d0",
  textLight: "#e5e9f0",
  textDark: "#2e3440",
  error: "#bf616a",
  warning: "#ebcb8b",
  success: "#a3be8c",
};

const oneDark: ThemePalette = {
  text: "#abb2bf",
  background: "#282c34",
  tint: "#61afef",
  surface: "#21252b",
  icon: "#5c6370",
  tabIconDefault: "#5c6370",
  tabIconSelected: "#61afef",
  textLight: "#ffffff",
  textDark: "#181a1f",
  error: "#e06c75",
  warning: "#e5c07b",
  success: "#98c379",
};

const catppuccin: ThemePalette = {
  text: "#cdd6f4",
  background: "#1e1e2e",
  tint: "#89b4fa",
  surface: "#181825",
  icon: "#a6adc8",
  tabIconDefault: "#a6adc8",
  tabIconSelected: "#89b4fa",
  textLight: "#f5f5f5",
  textDark: "#11111b",
  error: "#f38ba8",
  warning: "#f9e2af",
  success: "#a6e3a1",
};

const cyberpunk: ThemePalette = {
  text: "#e0e0ff",
  background: "#0d0221",
  tint: "#00ffff",
  surface: "#1a0a3e",
  icon: "#ff00ff",
  tabIconDefault: "#ff00ff",
  tabIconSelected: "#00ffff",
  textLight: "#ffffff",
  textDark: "#0a0015",
  error: "#ff003c",
  warning: "#ffff00",
  success: "#00ff41",
};

/* ─── Pride / LGBT Theme ───
 *  Dark base with a vibrant rainbow accent.
 *  The tint slot uses hot-pink as the representative primary;
 *  the rainbow effect is driven programmatically via AnimatedBackground. */

const pride: ThemePalette = {
  text: "#f0e6ff",
  background: "#1a1a2e",
  tint: "#ff6b9d",
  surface: "#2d2d44",
  icon: "#9b9bff",
  tabIconDefault: "#9b9bff",
  tabIconSelected: "#ff6b9d",
  textLight: "#ffffff",
  textDark: "#0a0a1a",
  error: "#ff0040",
  warning: "#ffd700",
  success: "#00ff7f",
};

/* ─── High Contrast Theme ─── */
const highContrast: ThemePalette = {
  text: "#FFFFFF",
  background: "#000000",
  tint: "#FFFF00",
  surface: "#1A1A1A",
  icon: "#FFFFFF",
  tabIconDefault: "#FFFFFF",
  tabIconSelected: "#FFFF00",
  textLight: "#000000",
  textDark: "#000000",
  error: "#FF0000",
  warning: "#FFA500",
  success: "#00FF00",
};

/* ─── Palette Map ─── */

export const themePalettes: Record<AppTheme, ThemePalette> = {
  light: {
    text: "#03060D",
    background: "#FFFFFF",
    tint: tintColorLight,
    surface: "#E3E3ED",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    textLight: "#FFFFFF",
    textDark: "#2C3033",
    error: "#C02C2C",
    warning: "#F0C62F",
    success: "#5AAF58",
  },
  dark: {
    text: "#FFFFFF",
    background: "#2C3033",
    tint: tintColorDark,
    surface: "#181819",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    textLight: "#FFFFFF",
    textDark: "#2C3033",
    error: "#C02C2C",
    warning: "#F0C62F",
    success: "#5AAF58",
  },
  gruvbox,
  "cherry-blossom": cherryBlossom,
  nord,
  "one-dark": oneDark,
  catppuccin,
  cyberpunk,
  pride,
  "high-contrast": highContrast,
};

/* ─── Re-export for backward compatibility ─── */

export const Colors = themePalettes;

export { gruvbox, cherryBlossom, nord, oneDark, catppuccin, cyberpunk, pride, highContrast };

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
