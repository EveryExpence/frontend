import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { FieldErrors, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { updateUserAvatar, updateUserEmail, updateUserName } from '@/context/userContext'
import EncryptedStorage from "react-native-encrypted-storage";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";
import { useAuth } from '@/context/authContext'
import { useRouter } from "expo-router";
import Topbar from "@/components/Topbar";
import ProfileIdentityCard from "@/components/settings/ProfileIdentityCard";
import ProfileFormSection from "@/components/settings/ProfileFormSection";
import ProfileActionButton from "@/components/settings/ProfileActionButton";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system/legacy';
import { apiFetch } from "@/utils/apiFetch";
import { uploadFileEndpoint } from "@/constants/endpoints";
import type { ProfileForm } from "@/types/profile";
import { useTranslation } from "react-i18next";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, refreshUser } = useAuth()
  const { control, handleSubmit, reset, setValue, getValues, formState: { isValid } } = useForm<ProfileForm>({
    mode: "onChange",
    defaultValues:{
      userName: "",
      email: "",
      avatarUrl: "",
    }
  });

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [displayUserName, setDisplayUserName] = useState("")
  const [displayEmail, setDisplayEmail] = useState("")
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState("")

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadUser()
  },[])

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
        if (avatarUrl.startsWith('file://')) {
          const formData = new FormData();
          formData.append('file', {
            uri: avatarUrl,
            name: 'avatar.jpg',
            type: 'image/jpeg'
          } as any);

          const uploadRes = await apiFetch(uploadFileEndpoint, {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            const base = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
            const domain = base.split('/api')[0];
            const absoluteUrl = domain + data.url;
            updateRequests.push(updateUserAvatar(token, absoluteUrl));
            await EncryptedStorage.removeItem("avatarSyncState");
          } else {
            const errText = await uploadRes.text().catch(() => "no body");
            console.error("Failed to upload avatar, keeping it unsynced. Status:", uploadRes.status, "Body:", errText);
            // If we fail to upload, we can throw or just let it stay unsynced.
            // But we shouldn't fail the whole profile update.
          }
        } else {
          updateRequests.push(updateUserAvatar(token, avatarUrl));
        }
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 24 }}
      >
        <Topbar
          title={t("settings.profile")}
          onBack={() => router.back()}
        />

        <ProfileIdentityCard
          displayUserName={displayUserName}
          displayEmail={displayEmail}
          displayAvatarUrl={displayAvatarUrl}
          isEditing={isEditing}
          isSaving={isSaving}
          onEditAvatar={async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              const fileName = `avatar_${Date.now()}.jpg`;
              const newUri = FileSystem.documentDirectory + fileName;
              
              const oldUri = getValues("avatarUrl") || displayAvatarUrl;
              if (oldUri?.startsWith('file://')) {
                try {
                  await FileSystem.deleteAsync(oldUri);
                } catch (e) {}
              }

              await FileSystem.copyAsync({
                from: asset.uri,
                to: newUri
              });

              setValue("avatarUrl", newUri);
              setDisplayAvatarUrl(newUri);
              await EncryptedStorage.setItem("localAvatarUrl", newUri);
              await EncryptedStorage.setItem("avatarSyncState", "updated");
            }
          }}
        />

        <ProfileFormSection
          control={control}
          isEditing={isEditing}
          isSaving={isSaving}
        />

        <ProfileActionButton
          isEditing={isEditing}
          isSaving={isSaving}
          isValid={isValid}
          onPress={() => {
            handleSubmit(async (data) => {
                if (isEditing) {
                  const didUpdate = await handleUpdate(data.email, data.userName, data.avatarUrl)
                  if (didUpdate) {
                    setIsEditing(false)

                    setTimeout(() => {
                        Toast.show({ text1: t("settings.profile_update_success") });
                    }, 100);
                  }
                } else {
                  setIsEditing(true)
                }
              },
              handleInvalid
            )();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;