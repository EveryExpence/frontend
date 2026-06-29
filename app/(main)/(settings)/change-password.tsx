import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, Text } from "react-native";
import React, { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import Toast from 'react-native-toast-message';
import { updateUserPassword } from '@/context/userContext'
import EncryptedStorage from "react-native-encrypted-storage";
import { useRouter } from "expo-router";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";
import ControlledInputField from "@/components/settings/ControlledInputField";
import Topbar from "@/components/Topbar";
import { useTranslation } from "react-i18next";

type ChangePasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { control, handleSubmit, reset, getValues, formState: { isValid } } = useForm<ChangePasswordForm>({
    mode: "onChange",
    defaultValues:{
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdatePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setIsSaving(true);
      const token = await EncryptedStorage.getItem(accessTokenKey);

      if (!token) { throw new Error("No access token"); }

      await updateUserPassword(token, oldPassword, newPassword);
      reset();
      Toast.show({ text1: t('settings.password_update_success') });
    } catch (err: any) {
      console.error(err);
      Toast.show({
        text1: err?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvalid = (formErrors: FieldErrors<ChangePasswordForm>) => {
    const firstError = Object.values(formErrors)[0];
    const errorMessage = firstError?.message || "Changing password failed";
    Toast.show({ text1: errorMessage, type: "error" });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-transparent"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 24 }}
      >
        <Topbar title={t("settings.change_password")} onBack={() => router.back()} />
        <View
          className="p-5 rounded-md gap-4 bg-theme-surface"
        >
          <ControlledInputField
            label={t("auth.old_password")}
            name="oldPassword"
            control={control}
            editable={!isSaving}
            secureTextEntry
            placeholder={t("auth.enter_old_password")}
          />

          <ControlledInputField
            label={t("auth.new_password")}
            name="newPassword"
            control={control}
            editable={!isSaving}
            secureTextEntry
            placeholder={t("auth.enter_new_password")}
            rules={{
              required: t("auth.error_password_required"),
              maxLength: {
                value: 64,
                message: t("auth.error_password_long"),
              },
              minLength: {
                value: 8,
                message: t("auth.error_password_short"),
              },
              pattern: {
                value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/,
                message: t("auth.error_password_pattern"),
              },
            }}
          />

          <ControlledInputField
            label={t("auth.confirm_password")}
            name="confirmPassword"
            control={control}
            editable={!isSaving}
            secureTextEntry
            placeholder={t("auth.confirm_new_password")}
            rules={{
              required: t("auth.error_confirm_required"),
              maxLength: {
                value: 64,
                message: t("auth.error_password_long"),
              },
              minLength: {
                value: 8,
                message: t("auth.error_password_short"),
              },
              pattern: {
                value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/,
                message: t("auth.error_password_pattern"),
              },
              validate: (value) => {
                return value === getValues("newPassword") || t("auth.error_passwords_match");
              }
            }}
          />

        </View>

        <TouchableOpacity
          className={`mt-6 p-4 rounded-md items-center ${isSaving || !isValid ? 'bg-theme-icon opacity-60' : 'bg-theme-tint' }`}
          disabled={isSaving || !isValid}
          onPress={handleSubmit(
            (data) => handleUpdatePassword(data.oldPassword, data.newPassword),
            handleInvalid
          )}
        >
          <Text 
          className="text-xl text-center text-theme-textLight font-semibold"
          >
            {isSaving ? t("common.loading") : t("settings.update_password")}
            
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePasswordScreen;