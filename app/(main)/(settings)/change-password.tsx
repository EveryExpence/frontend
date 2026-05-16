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

type ChangePasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordScreen = () => {
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

      if (!token) throw new Error("No access token");

      await updateUserPassword(token, oldPassword, newPassword);
      reset();
      Toast.show({ text1: "Password updated successfully" });
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
      className="flex-1 bg-theme-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 24 }}
      >
        <Topbar title="Change Password" onBack={() => router.back()} />
        <View
          className="p-5 rounded-md gap-4 bg-theme-surface"
        >
          <ControlledInputField
            label="Old Password"
            name="oldPassword"
            control={control}
            editable={!isSaving}
            secureTextEntry
          />

          <ControlledInputField
            label="New Password"
            name="newPassword"
            control={control}
            editable={!isSaving}
            secureTextEntry
            rules={{
              required:"New password is required",
              maxLength: {
                value: 64,
                message: "Password is too long",
              },
              minLength: {
                value: 8,
                message: "Password is too short",
              },
              pattern: {
                value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/,
                message: "Password must contain at least one digit, one lowercase, and one uppercase letter",
              },
            }}
          />

          <ControlledInputField
            label="Confirm New Password"
            name="confirmPassword"
            control={control}
            editable={!isSaving}
            secureTextEntry
            rules={{
              required:"Confirm password is required",
              maxLength: {
                value: 64,
                message: "Password is too long",
              },
              minLength: {
                value: 8,
                message: "Password is too short",
              },
              pattern: {
                value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/,
                message: "Password must contain at least one digit, one lowercase, and one uppercase letter",
              },
              validate: (value) => {
                return value === getValues("newPassword") || "Passwords do not match";
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
            {isSaving ? "Updating..." : "Update Password"}
            
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePasswordScreen;