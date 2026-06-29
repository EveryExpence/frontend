import React, { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface DashboardWidgetCardProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: ReactNode;
  customAction?: ReactNode;
}

export const DashboardWidgetCard: React.FC<DashboardWidgetCardProps> = ({
  title,
  actionLabel,
  onActionPress,
  children,
  customAction,
}) => {
  return (
    <Animated.View entering={FadeInUp.springify().mass(0.6).damping(14).delay(100)} className="rounded-xl bg-theme-background px-4 py-4 shadow-sm mb-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-[20px] font-semibold text-theme-text">
          {title}
        </Text>

        {actionLabel && onActionPress ? (
          <Pressable
            accessible
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onActionPress}
            hitSlop={10}
          >
            <Text className="text-[17px] font-medium text-theme-tint">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
        
        {customAction}
      </View>

      <View className="mt-4">{children}</View>
    </Animated.View>
  );
};
