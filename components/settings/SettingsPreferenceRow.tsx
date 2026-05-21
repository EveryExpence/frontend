import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  title: string;
  iconName: string;
  currentValue: string;
  onPress: () => void;
};

const SettingsPreferenceRow = ({ title, iconName, currentValue, onPress }: Props) => {
  const iconColor = useThemeColor({}, "icon");

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="h-[75px] flex-row items-center px-3 justify-between bg-theme-surface"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View style={{ marginRight: 12 }}>
          <Ionicons name={iconName as any} size={30} color={iconColor} />
        </View>
        <Text selectable={false} className="text-xl font-bold text-theme-text">
          {title}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Text selectable={false} className="text-xl font-semibold text-theme-icon">
          {currentValue}
        </Text>
        <Ionicons name="chevron-forward" size={28} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
};

export default SettingsPreferenceRow;
