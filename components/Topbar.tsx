import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

type TopbarProps = {
  title: string;
  onBack?: () => void;
};

const Topbar = ({ title, onBack }: TopbarProps) => {
  const iconColor = useThemeColor({}, "icon");

  return (
    <View className="flex-row items-center mb-4 px-4">
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          className="p-2 mr-2"
          activeOpacity={0.8}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={iconColor} />
        </TouchableOpacity>
      ) : null}

      <Text className="text-2xl font-bold text-theme-text">
        {title}
      </Text>
    </View>
  );
};

export default Topbar;
