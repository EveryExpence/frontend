import React from "react";
import { Image, TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

type ProfileIdentityCardProps = {
  displayUserName: string;
  displayEmail: string;
  displayAvatarUrl: string;
  isEditing: boolean;
  isSaving: boolean;
  onEditAvatar: () => void;
};

const ProfileIdentityCard = ({
  displayUserName,
  displayEmail,
  displayAvatarUrl,
  isEditing,
  isSaving,
  onEditAvatar,
}: ProfileIdentityCardProps) => {
  const iconColor = useThemeColor({}, "icon");

  return (
    <View className="items-center mb-8">
      <TouchableOpacity
        className="items-center justify-center rounded-full bg-theme-surface"
        style={{ width: 100, height: 100 }}
        disabled={!isEditing || isSaving}
        activeOpacity={0.8}
        onPress={onEditAvatar}
      >
        {displayAvatarUrl ? (
          <Image
            source={{ uri: displayAvatarUrl }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="person" size={70} color={iconColor} />
        )}

        {isEditing && (
          <View className="absolute bottom-0 right-0 rounded-full bg-theme-tint p-2">
            <Ionicons name="pencil" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <Text className="mt-4 text-3xl font-semibold text-theme-text">
        {displayUserName}
      </Text>

      <Text className="text-2xl text-theme-icon">
        {displayEmail}
      </Text>
    </View>
  );
};

export default ProfileIdentityCard;
