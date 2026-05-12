import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { useThemeColor } from "@/hooks/use-theme-color";
import Toast from 'react-native-toast-message';
import { updateUserAvatar, updateUserEmail, updateUserName } from '@/context/userContext'
import EncryptedStorage from "react-native-encrypted-storage";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";
import { useAuth } from '@/context/authContext'
import { useRouter } from "expo-router";

type ProfileForm = {
  userName: string;
  email: string;
  avatarUrl: string;
};

const ProfileScreen = () => {
  const router = useRouter();
  const { user, refreshUser } = useAuth()
  const { control, handleSubmit, reset, setValue, getValues, formState: { errors, isValid } } = useForm<ProfileForm>({
    mode: "onChange",
    defaultValues:{
      userName: "",
      email: "",
      avatarUrl: "",
    }
  });

  const iconColor = useThemeColor({}, "icon");
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [displayUserName, setDisplayUserName] = useState("")
  const [displayEmail, setDisplayEmail] = useState("")
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState("")
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false)
  const [avatarDraft, setAvatarDraft] = useState("")

  const isValidAvatarUrl = (value: string) => {
    if (!value) return true;
    return /^https?:\/\/\S+$/i.test(value);
  }

  const loadUser = async () => {
    try{
      await refreshUser();
    }catch(err: any){
      console.error(err);
      Toast.show({ 
        text1: err?.message || "Something went wrong", 
        type: "error" 
      });
    }
  }
  useEffect(() => {
    loadUser()
  },[loadUser])

  useEffect(() => {
    if (!user) return;

    const nextUserName = user.publicUsername ?? "User";
    const nextEmail = user.email ?? "None";

    reset({
      userName: nextUserName,
      email: nextEmail,
      avatarUrl: user.avatarUrl ?? "",
    });

    setDisplayUserName(nextUserName);
    setDisplayEmail(nextEmail);
    setDisplayAvatarUrl(user.avatarUrl ?? "");
  }, [user, reset]);

  const handleUpdate = async (email: string, userName: string, avatarUrl: string) => {
    try{
      setIsSaving(true);
      const token = await EncryptedStorage.getItem(accessTokenKey)

      if (!token) throw new Error("No access token");

      const updateRequests = [
        updateUserEmail(token, email),
        updateUserName(token, userName)
      ];

      if (avatarUrl && avatarUrl !== user?.avatarUrl) {
        updateRequests.push(updateUserAvatar(token, avatarUrl));
      }

      await Promise.all(updateRequests);

      await refreshUser();
      return true;
    }catch (err: any){
      console.error(err);
      Toast.show({ 
        text1: err?.message || "Something went wrong", 
        type: "error" 
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  const handleInvalid = (formErrors: FieldErrors<ProfileForm>) => {
    const firstError = Object.values(formErrors)[0];
    const errorMessage = firstError?.message || "Changing profile failed";
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
            Profile
          </Text>
        </View>

        <View className="items-center mb-8">

          <TouchableOpacity
            className="items-center justify-center rounded-full bg-theme-surface"
            style={{ width: 100, height: 100 }}
            disabled={!isEditing || isSaving}
            activeOpacity={0.8}
            onPress={() => {
              const currentValue = getValues("avatarUrl") || displayAvatarUrl;
              setAvatarDraft(currentValue);
              setIsAvatarModalVisible(true);
            }}
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

        <View
          className="p-5 rounded-md gap-4 bg-theme-surface"
        >
          <View>
            <Text className="text-2xl mb-1 text-theme-icon">
              Username
            </Text>

            <Controller
              control={control}
              name="userName"
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
              render={({ field: {onChange, value}}) => (
                <TextInput
                  editable={isEditing && !isSaving}
                  value={value}
                  className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                  onChangeText={onChange}
                />
              )}
            />

            {errors.userName && (
              <Text className="text-red-500 text-sm pl-2 mt-1">
                  {errors.userName.message}
              </Text>
            )}

          </View>

          <View>
            <Text className="text-2xl mb-1 text-theme-icon">
              Email
            </Text>

            <Controller
              control={control}
              name="email"
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
              render={({ field: {onChange, value}}) => (
                <TextInput
                  editable={isEditing && !isSaving}
                  value={value}
                  className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                  onChangeText={onChange}
                />
              )}
            />

            {errors.email && (
              <Text className="text-red-500 text-sm pl-2 mt-1">
                  {errors.email.message}
              </Text>
            )}
            
          </View>

        </View>

        <TouchableOpacity
          className={`mt-6 p-4 rounded-md items-center ${isEditing ? "bg-theme-success" : "bg-theme-tint"} ${isEditing && !isValid ? "opacity-60" : "opacity-100"}`}
          disabled={isSaving || (isEditing && !isValid)}
          onPress={() => {
              handleSubmit(async (data) => {
                  if (isEditing) {
                    const didUpdate = await handleUpdate(data.email, data.userName, data.avatarUrl)
                    if (didUpdate) {
                      setIsEditing(false)

                      setTimeout(() => {
                          Toast.show({ text1: "Changed profile successfully" });
                      }, 100);
                    }
                  } else {
                    setIsEditing(true)
                  }
                },
                handleInvalid
              )();
            }}
        >
          <Text 
          className="text-xl text-center text-theme-textLight font-semibold"
          >
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
            
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent
        visible={isAvatarModalVisible}
        animationType="fade"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-lg bg-theme-surface p-5">
            <Text className="text-2xl mb-3 text-theme-text">Change avatar</Text>

            <TextInput
              value={avatarDraft}
              placeholder="https://..."
              className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
              onChangeText={setAvatarDraft}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="mt-4 flex-row justify-end gap-3">
              <TouchableOpacity
                className="px-4 py-3 rounded-md bg-theme-background"
                onPress={() => setIsAvatarModalVisible(false)}
              >
                <Text className="text-lg text-theme-text">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3 rounded-md bg-theme-tint"
                onPress={() => {
                  const trimmed = avatarDraft.trim();
                  if (!isValidAvatarUrl(trimmed)) {
                    Toast.show({ text1: "Invalid URL format", type: "error" });
                    return;
                  }

                  setValue("avatarUrl", trimmed);
                  setDisplayAvatarUrl(trimmed);
                  setIsAvatarModalVisible(false);
                }}
              >
                <Text className="text-lg text-theme-textLight">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;