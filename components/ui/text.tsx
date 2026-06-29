import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

export type TextProps = RNTextProps & {
  className?: string;
};

/**
 * Custom Text component that limits the maximum font size multiplier
 * to ensure the UI looks normal on every size while keeping accessibility,
 * adhering to best practices from Android development.
 */
export const Text: React.FC<TextProps> = ({
  className = "",
  maxFontSizeMultiplier = 1.3,
  ...props
}) => {
  return (
    <RNText
      className={`text-theme-text ${className}`}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    />
  );
};
