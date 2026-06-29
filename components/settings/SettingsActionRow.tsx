import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  title: string;
  iconName: string;
  tone?: "danger";
  showChevron?: boolean;
  onPress: () => void;
};

const SettingsActionRow = ({ title, iconName, tone, showChevron = false, onPress }: Props) => {
  const titleColor = useThemeColor({}, tone === "danger" ? "error" : "text");
  const iconColor = useThemeColor({}, tone === "danger" ? "error" : "icon");
  const chevronColor = useThemeColor({}, "icon");

  return (
    <TouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.8}
      className="h-[75px] flex-row items-center px-3 justify-between bg-theme-surface"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View style={{ marginRight: 12 }}>
          <Ionicons name={iconName as any} size={30} color={iconColor} />
        </View>
        <Text selectable={false} className="text-xl font-bold" style={{ color: titleColor }}>
          {title}
        </Text>
      </View>

      {showChevron && (
        <Ionicons name="chevron-forward" size={28} color={chevronColor} />
      )}
    </TouchableOpacity>
  );
};

export default SettingsActionRow;
