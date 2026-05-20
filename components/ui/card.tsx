import React from "react";
import { View, ViewProps, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

type CardProps = ViewProps & {
  className?: string;
};

export function Card({ style, className = "", ...props }: CardProps) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  return (
    <View
      className={`overflow-hidden rounded-lg ${className}`}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor:
            scheme === "light"
              ? "rgba(3, 6, 13, 0.05)"
              : "rgba(255, 255, 255, 0.06)",
          borderWidth: 1,
        },
        style,
      ]}
      {...props}
    />
  );
}

type CardContentProps = ViewProps & {
  className?: string;
};

export function CardContent({
  style,
  className = "",
  ...props
}: CardContentProps) {
  return <View className={`p-0 ${className}`} style={style} {...props} />;
}
