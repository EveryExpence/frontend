import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";

type Props = {
  title: string;
  iconName: string;
  isEnabled: boolean;
  onToggle: () => void;
};

const SettingsToggleRow = ({ title, iconName, isEnabled, onToggle }: Props) => {
  const iconColor = useThemeColor({}, "icon");
  
  const translateX = useSharedValue(isEnabled ? 20 : 0);
  
  useEffect(() => {
    translateX.value = withTiming(isEnabled ? 20 : 0, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isEnabled]);

  const dotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="h-[75px] flex-row items-center px-3 justify-between bg-theme-surface"
      onPress={onToggle}
    >
      <View className="flex-row items-center">
        <View style={{ marginRight: 12 }}>
          <Ionicons name={iconName as any} size={30} color={iconColor} />
        </View>
        <Text selectable={false} className="text-xl font-bold text-theme-text">
          {title}
        </Text>
      </View>

      <View
        className={`w-11 h-6 rounded-full p-0.5 justify-center ${
          isEnabled ? "bg-theme-tint" : "bg-theme-icon"
        }`}
      >
        <Animated.View
          className="w-5 h-5 rounded-full bg-theme-textLight absolute left-0.5"
          style={dotStyle}
        />
      </View>
    </TouchableOpacity>
  );
};

export default SettingsToggleRow;
