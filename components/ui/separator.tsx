import React from "react";
import { View, ViewProps, useColorScheme } from "react-native";

type SeparatorProps = ViewProps & {
  className?: string;
};

export function Separator({ style, className = "", ...props }: SeparatorProps) {
  const scheme = useColorScheme() ?? "light";

  return (
    <View
      className={className}
      style={[
        {
          height: 1,
          backgroundColor:
            scheme === "light"
              ? "rgba(3, 6, 13, 0.08)"
              : "rgba(255, 255, 255, 0.08)",
        },
        style,
      ]}
      {...props}
    />
  );
}