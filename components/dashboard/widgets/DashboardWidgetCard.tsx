import React, { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface DashboardWidgetCardProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: ReactNode;
}

export const DashboardWidgetCard: React.FC<DashboardWidgetCardProps> = ({
  title,
  actionLabel,
  onActionPress,
  children,
}) => {
  return (
    <View className="rounded-xl bg-theme-surface px-4 py-4 shadow-sm">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-[20px] font-semibold text-theme-text">
          {title}
        </Text>

        {actionLabel && onActionPress ? (
          <Pressable
            onPress={onActionPress}
            hitSlop={10}
            accessibilityRole="button"
          >
            <Text className="text-[17px] font-medium text-theme-tint">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-4">{children}</View>
    </View>
  );
};
