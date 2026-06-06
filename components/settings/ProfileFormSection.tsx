import React from "react";
import { View } from "react-native";
import { Control } from "react-hook-form";
import ControlledInputField from "@/components/settings/ControlledInputField";
import type { ProfileForm } from "@/types/profile";
import { useTranslation } from "react-i18next";

type ProfileFormSectionProps = {
  control: Control<ProfileForm>;
  isEditing: boolean;
  isSaving: boolean;
};

const ProfileFormSection = ({ control, isEditing, isSaving }: ProfileFormSectionProps) => {
  const { t } = useTranslation();
  return (
    <View className="p-5 rounded-md gap-4 bg-theme-surface">
      <ControlledInputField
        label={t("auth.username")}
        name="userName"
        control={control}
        editable={isEditing && !isSaving}
        rules={{
          required: t("auth.error_username_required"),
          maxLength: {
            value: 20,
            message: t("auth.error_username_long"),
          },
          minLength: {
            value: 3,
            message: t("auth.error_username_short"),
          },
        }}
      />

      <ControlledInputField
        label={t("auth.email")}
        name="email"
        control={control}
        editable={isEditing && !isSaving}
        rules={{
          required: t("auth.error_email_required"),
          maxLength: {
            value: 40,
            message: t("auth.error_email_long"),
          },
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: t("auth.error_invalid_email"),
          },
        }}
      />
    </View>
  );
};

export default ProfileFormSection;
