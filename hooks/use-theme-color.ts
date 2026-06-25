/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import type { AppTheme } from '@/types/theme';
import { useTheme } from '@/context/themeContext';

type ThemeColorName = keyof typeof Colors.light;

export function useThemeColor(
  props: Partial<Record<AppTheme, string>>,
  colorName: ThemeColorName,
) {
  const { theme } = useTheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme]?.[colorName] ?? Colors.light[colorName];
}
