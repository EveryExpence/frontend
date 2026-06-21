import { Colors } from "@/constants/theme";
import { themePreferenceKey } from "@/constants/themePreference";
import type { AppTheme } from "@/types/theme";
import EncryptedStorage from "react-native-encrypted-storage";
import {
  Appearance,
  type ColorSchemeName,
  useColorScheme as useSystemColorScheme,
} from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

const isAppTheme = (value: ColorSchemeName): value is AppTheme => {
  return value === "light" || value === "dark";
};

const applyThemeToDocument = (theme: AppTheme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  Object.entries(Colors[theme]).forEach(([key, value]) => {
    const cssVarName = `--theme-${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
    root.style.setProperty(cssVarName, value);
  });

  root.setAttribute("data-theme", theme);
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useSystemColorScheme();
  const [preferredTheme, setPreferredTheme] = useState<AppTheme | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const theme = preferredTheme ?? (isAppTheme(systemTheme) ? systemTheme : "light");

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await EncryptedStorage.getItem(themePreferenceKey);

        if (storedTheme === "light" || storedTheme === "dark") {
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

  useEffect(() => {
    if (preferredTheme) {
      Appearance.setColorScheme(preferredTheme);
    } else {
      Appearance.setColorScheme(null);
    }

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
    await setTheme(theme === "dark" ? "light" : "dark");
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