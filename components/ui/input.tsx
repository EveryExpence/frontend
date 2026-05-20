import React from "react";
import { TextInput, TextInputProps, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export const Input = React.forwardRef<TextInput, TextInputProps>(
  ({ style, className = "", ...props }, ref) => {
    const scheme = useColorScheme() ?? "light";
    const colors = Colors[scheme];
    const isLight = scheme === "light";

    return (
      <TextInput
        ref={ref}
        className={`h-12 rounded-xl px-4 text-base text-theme-text ${className}`}
        placeholderTextColor={colors.icon}
        style={[
          {
            backgroundColor: isLight ? "#E3E3ED" : "#303338",
            borderColor: isLight ? "rgba(3, 6, 13, 0.08)" : "rgba(255, 255, 255, 0.08)",
            borderWidth: 1,
          },
          style,
        ]}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";