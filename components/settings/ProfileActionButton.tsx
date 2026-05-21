import React from "react";
import { TouchableOpacity, Text } from "react-native";

type ProfileActionButtonProps = {
  isEditing: boolean;
  isSaving: boolean;
  isValid: boolean;
  onPress: () => void;
};

const ProfileActionButton = ({
  isEditing,
  isSaving,
  isValid,
  onPress,
}: ProfileActionButtonProps) => (
  <TouchableOpacity
    className={`mt-6 p-4 rounded-md items-center ${isEditing ? "bg-theme-success" : "bg-theme-tint"} ${isEditing && !isValid ? "opacity-60" : "opacity-100"}`}
    disabled={isSaving || (isEditing && !isValid)}
    onPress={onPress}
  >
    <Text className="text-xl text-center text-theme-textLight font-semibold">
      {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
    </Text>
  </TouchableOpacity>
);

export default ProfileActionButton;
