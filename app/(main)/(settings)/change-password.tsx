import { TextInput, TouchableOpacity, View, Text } from "react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Toast from 'react-native-toast-message';
import { updateUserPassword } from '@/context/userContext'
import EncryptedStorage from "react-native-encrypted-storage";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";

type ChangePasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordScreen = () => {
  const { control, handleSubmit, reset, getValues, formState: {errors} } = useForm<ChangePasswordForm>({
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

  return (
    <View
      className="px-6 pt-10 bg-theme-background"
    >
      <View
        className="p-5 rounded-md gap-4 bg-theme-surface"
      >
        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            Old Password
          </Text>

          <Controller
            control={control}
            name="oldPassword"
            rules={{
              required:"Old password is required",
              maxLength: {
                value: 64,
                message: "Password is too long",
              },
              minLength: {
                value: 8,
                message: "Password is too short",
              },
            }}
            render={({ field: {onChange, value}}) => (
              <TextInput
                editable={!isSaving}
                value={value}
                secureTextEntry
                className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                onChangeText={onChange}
              />
            )}
          />

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
                secureTextEntry
                className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                onChangeText={onChange}
              />
            )}
          />

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
                secureTextEntry
                className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                onChangeText={onChange}
              />
            )}
          />

          {errors.confirmPassword && (
            <Text className="text-red-500 text-sm pl-2 mt-1">
                {errors.confirmPassword.message}
            </Text>
          )}
          
        </View>

      </View>

      <TouchableOpacity
        className={`mt-6 p-4 rounded-md items-center ${isSaving ? 'bg-theme-icon' : 'bg-theme-tint' }`}
        disabled={isSaving}
        onPress={handleSubmit(
          (data) => handleUpdatePassword(data.oldPassword, data.newPassword),
          () => {
            Toast.show({ text1: "Changing password failed", type: "error" });
          }
        )}
      >
        <Text 
        className="text-xl text-center text-theme-textLight font-semibold"
        >
          {isSaving ? "Updating..." : "Update Password"}
          
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default ChangePasswordScreen;