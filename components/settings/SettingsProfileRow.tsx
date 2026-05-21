import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  userName: string;
  email: string;
  avatarUrl?: string;
  onPress: () => void;
};

const SettingsProfileRow = ({ userName, email, avatarUrl, onPress }: Props) => {
  const iconColor = useThemeColor({}, "icon");

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="h-[75px] flex-row items-center px-3 justify-between bg-theme-surface"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="w-14 h-14 rounded-full mr-3 items-center justify-center overflow-hidden bg-theme-surface">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 60, height: 60, borderRadius: 20 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-outline" size={40} color={iconColor} />
          )}
        </View>

        <View>
          <Text selectable={false} className="text-xl font-bold text-theme-text">
            {userName}
          </Text>
          <Text selectable={false} className="text-base mt-1 font-semibold text-theme-icon">
            {email}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={28} color={iconColor} />
    </TouchableOpacity>
  );
};

export default SettingsProfileRow;
