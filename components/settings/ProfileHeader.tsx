import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

type ProfileHeaderProps = {
  title: string;
  onBack: () => void;
};

const ProfileHeader = ({ title, onBack }: ProfileHeaderProps) => {
  const iconColor = useThemeColor({}, "icon");

  return (
    <View className="flex-row items-center justify-between mb-4">
      <TouchableOpacity
        onPress={onBack}
        className="p-2"
        activeOpacity={0.8}
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={26} color={iconColor} />
      </TouchableOpacity>

      <Text className="text-2xl font-bold text-theme-text">
        {title}
      </Text>
    </View>
  );
};

export default ProfileHeader;
