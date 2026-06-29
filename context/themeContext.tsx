import { Colors } from "@/constants/theme";
import { themePreferenceKey } from "@/constants/themePreference";
import type { AppTheme } from "@/types/theme";
import EncryptedStorage from "react-native-encrypted-storage";
import {
  Appearance,
  type ColorSchemeName,
  useColorScheme as useSystemColorScheme,
} from "react-native";
import { StyleSheet } from "nativewind";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ALL_THEMES: readonly AppTheme[] = [
  "light",
  "dark",
  "gruvbox",
  "cherry-blossom",
  "nord",
  "one-dark",
  "catppuccin",
  "cyberpunk",
  "pride",
];

type ThemeContextValue = {
  theme: AppTheme;
  isHydrated: boolean;
  setTheme: (theme: AppTheme) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  isHydrated: false,
  setTheme: async () => undefined,
  toggleTheme: async () => undefined,
});

const isAppTheme = (value: ColorSchemeName | string | null | undefined): value is AppTheme => {
  return ALL_THEMES.includes((value ?? "") as AppTheme);
};

/* ─── CSS variable name from a camelCase token ─── */
const toCssVar = (key: string) =>
  `--theme-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

/* ─── Web: update DOM custom properties ─── */
const applyThemeToDocument = (theme: AppTheme) => {
  if (typeof document === "undefined") { return; }

  const palette = Colors[theme];
  if (!palette) { return; }

  const root = document.documentElement;
  (Object.entries(palette) as [string, string][]).forEach(([key, value]) => {
    root.style.setProperty(toCssVar(key), value);
  });
  root.setAttribute("data-theme", theme);
};

/* ─── Native / Web: update NativeWind's CSS variable observables ───
 *  Setting both `light` and `dark` to the same value means the resolved
 *  colour is always the palette colour regardless of the system scheme.   */
const applyThemeToNativeWind = (theme: AppTheme) => {
  const palette = Colors[theme];
  if (!palette) { return; }

  const rootVariables: Record<string, { light: string; dark: string }> = {};

  (Object.entries(palette) as [string, string][]).forEach(([key, value]) => {
    rootVariables[toCssVar(key)] = { light: value, dark: value };
  });

  StyleSheet.registerCompiled({ $compiled: true, rootVariables });
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useSystemColorScheme();
  const [preferredTheme, setPreferredTheme] = useState<AppTheme | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const theme: AppTheme = preferredTheme ?? (isAppTheme(systemTheme) ? systemTheme : "light");

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await EncryptedStorage.getItem(themePreferenceKey);

        if (isAppTheme(storedTheme)) {
          setPreferredTheme(storedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme preference", error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadThemePreference();
  }, []);

  /* ─── Apply theme whenever preferredTheme or resolved theme changes ─── */
  useEffect(() => {
    /* Keep the OS colour scheme in sync so system UI (status bar, etc.)
       follows the selected theme. */
    if (preferredTheme) {
      Appearance.setColorScheme(
        preferredTheme === "light" || preferredTheme === "dark"
          ? preferredTheme
          : "dark",
      );
    } else {
      Appearance.setColorScheme(null);
    }

    /* Update CSS-variable-backed theme colours for both platforms */
    applyThemeToNativeWind(theme);
    applyThemeToDocument(theme);
  }, [preferredTheme, theme]);

  const setTheme = useCallback(async (nextTheme: AppTheme) => {
    setPreferredTheme(nextTheme);
    try {
      await EncryptedStorage.setItem(themePreferenceKey, nextTheme);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === "dark" ? "light" : "dark";
    await setTheme(next);
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, isHydrated, setTheme, toggleTheme }),
    [theme, isHydrated, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
