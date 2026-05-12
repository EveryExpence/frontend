import React from "react";
import { View } from "react-native";
import { Control } from "react-hook-form";
import ControlledInputField from "@/components/settings/ControlledInputField";
import type { ProfileForm } from "@/types/profile";

type ProfileFormSectionProps = {
  control: Control<ProfileForm>;
  isEditing: boolean;
  isSaving: boolean;
};

const ProfileFormSection = ({ control, isEditing, isSaving }: ProfileFormSectionProps) => (
  <View className="p-5 rounded-md gap-4 bg-theme-surface">
    <ControlledInputField
      label="Username"
      name="userName"
      control={control}
      editable={isEditing && !isSaving}
      rules={{
        required:"Username is required",
        maxLength: {
          value: 20,
          message: "Username is too long",
        },
        minLength: {
          value: 3,
          message: "Username is too short",
        },
      }}
    />

    <ControlledInputField
      label="Email"
      name="email"
      control={control}
      editable={isEditing && !isSaving}
      rules={{
        required:"Email is required",
        maxLength: {
          value: 40,
          message: "Email is too long",
        },
        pattern: {
          value: /^\S+@\S+\.\S+$/,
          message: "Invalid email format",
        },
      }}
    />
  </View>
);

export default ProfileFormSection;
