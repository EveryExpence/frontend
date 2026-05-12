import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View, Text } from "react-native";
import React, { useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import Toast from 'react-native-toast-message';
import { updateUserPassword } from '@/context/userContext'
import EncryptedStorage from "react-native-encrypted-storage";
import { useRouter } from "expo-router";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

type ChangePasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordScreen = () => {
  const router = useRouter();
  const iconColor = useThemeColor({}, "icon");
  const { control, handleSubmit, reset, getValues, formState: { errors, isValid } } = useForm<ChangePasswordForm>({
    mode: "onChange",
    defaultValues:{
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
            activeOpacity={0.8}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={iconColor} />
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-theme-text">
            Change Password
          </Text>
        </View>
        <View
          className="p-5 rounded-md gap-4 bg-theme-surface"
        >
          <View>
            <Text className="text-2xl mb-1 text-theme-icon">
              Old Password
            </Text>

            <View className="flex-row items-center">
              <Controller
                control={control}
                name="oldPassword"
                render={({ field: {onChange, value}}) => (
                  <TextInput
                    editable={!isSaving}
                    value={value}
                    secureTextEntry={!showOldPassword}
                    className="w-full p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                    onChangeText={onChange}
                  />
                )}
              />
              <MaterialCommunityIcons
                name={showOldPassword ? "eye-off" : "eye"}
                size={24}
                color={iconColor}
                onPress={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-4 text-theme-icon"
              />
            </View>

            {errors.oldPassword && (
              <Text className="text-red-500 text-sm pl-2 mt-1">
                  {errors.oldPassword.message}
              </Text>
            )}

          </View>

          <View>
            <Text className="text-2xl mb-1 text-theme-icon">
              New Password
            </Text>

            <View className="flex-row items-center">
              <Controller
                control={control}
                name="newPassword"
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
                render={({ field: {onChange, value}}) => (
                  <TextInput
                    editable={!isSaving}
                    value={value}
                    secureTextEntry={!showNewPassword}
                    className="w-full p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                    onChangeText={onChange}
                  />
                )}
              />
              <MaterialCommunityIcons
                name={showNewPassword ? "eye-off" : "eye"}
                size={24}
                color={iconColor}
                onPress={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-4 text-theme-icon"
              />
            </View>

            {errors.newPassword && (
              <Text className="text-red-500 text-sm pl-2 mt-1">
                  {errors.newPassword.message}
              </Text>
            )}
            
          </View>

          <View>
            <Text className="text-2xl mb-1 text-theme-icon">
              Confirm New Password
            </Text>

            <View className="flex-row items-center">
              <Controller
                control={control}
                name="confirmPassword"
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
                render={({ field: {onChange, value}}) => (
                  <TextInput
                    editable={!isSaving}
                    value={value}
                    secureTextEntry={!showConfirmPassword}
                    className="w-full p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                    onChangeText={onChange}
                  />
                )}
              />
              <MaterialCommunityIcons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={24}
                color={iconColor}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 text-theme-icon"
              />
            </View>

            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm pl-2 mt-1">
                  {errors.confirmPassword.message}
              </Text>
            )}
            
          </View>

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