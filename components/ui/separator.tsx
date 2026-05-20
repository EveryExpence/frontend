import React from "react";
import { View, ViewProps } from "react-native";

type SeparatorProps = ViewProps & {
  className?: string;
};

export function Separator({ className = "", ...props }: SeparatorProps) {
  return (
    <View
      className={`h-px bg-theme-icon ${className}`}
      {...props}
    />
  );
}