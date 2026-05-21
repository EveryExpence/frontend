import React from "react";
import { View, ViewProps } from "react-native";

type CardProps = ViewProps & {
  className?: string;
};

export function Card({ className = "", ...props }: CardProps) {
  return (
    <View
      className={`overflow-hidden rounded-lg bg-theme-surface ${className}`}
      {...props}
    />
  );
}

type CardContentProps = ViewProps & {
  className?: string;
};

export function CardContent({
  className = "",
  ...props
}: CardContentProps) {
  return <View className={`p-0 ${className}`} {...props} />;
}
