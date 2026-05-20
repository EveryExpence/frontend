import React from "react";
import { TextInput, TextInputProps, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export const Input = React.forwardRef<TextInput, TextInputProps>(
  ({ className = "", ...props }, ref) => {
    const scheme = useColorScheme() ?? "light";
    const colors = Colors[scheme];

    return (
      <TextInput
        ref={ref}
        className={`h-12 rounded-lg bg-theme-surface px-4 text-base text-theme-text ${className}`}
        placeholderTextColor={colors.icon}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
