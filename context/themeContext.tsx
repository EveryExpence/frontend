import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform, useColorScheme as useSystemColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import type { AppTheme } from "@/types/settings";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  colors: typeof Colors.light;
  systemTheme: AppTheme;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemTheme = (useSystemColorScheme() ?? "light") as AppTheme;
  const [theme, setTheme] = useState<AppTheme>(systemTheme);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const themeColors = Colors[theme];

    root.style.setProperty("--theme-text", themeColors.text);
    root.style.setProperty("--theme-background", themeColors.background);
    root.style.setProperty("--theme-tint", themeColors.tint);
    root.style.setProperty("--theme-surface", themeColors.surface);
    root.style.setProperty("--theme-icon", themeColors.icon);
    root.style.setProperty("--theme-text-light", themeColors.textLight);
    root.style.setProperty("--theme-text-dark", themeColors.textDark);
    root.style.setProperty("--theme-error", themeColors.error);
    root.style.setProperty("--theme-warning", themeColors.warning);
    root.style.setProperty("--theme-success", themeColors.success);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    colors: Colors[theme],
    systemTheme,
  }), [theme, systemTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
