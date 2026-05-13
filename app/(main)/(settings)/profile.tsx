import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { FieldErrors, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { updateUserAvatar, updateUserEmail, updateUserName } from '@/context/userContext'
import EncryptedStorage from "react-native-encrypted-storage";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";
import { useAuth } from '@/context/authContext'
import { useRouter } from "expo-router";
import ProfileHeader from "@/components/settings/ProfileHeader";
import ProfileIdentityCard from "@/components/settings/ProfileIdentityCard";
import ProfileFormSection from "@/components/settings/ProfileFormSection";
import ProfileActionButton from "@/components/settings/ProfileActionButton";
import AvatarUrlModal from "@/components/settings/AvatarUrlModal";
import type { ProfileForm } from "@/types/profile";

const ProfileScreen = () => {
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
        <ProfileHeader
          title="Profile"
          onBack={() => router.back()}
        />

        <ProfileIdentityCard
          displayUserName={displayUserName}
          displayEmail={displayEmail}
          displayAvatarUrl={displayAvatarUrl}
          isEditing={isEditing}
          isSaving={isSaving}
          onEditAvatar={() => {
            const currentValue = getValues("avatarUrl") || displayAvatarUrl;
            setAvatarDraft(currentValue);
            setIsAvatarModalVisible(true);
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
        />
      </ScrollView>

      <AvatarUrlModal
        visible={isAvatarModalVisible}
        avatarDraft={avatarDraft}
        onChangeDraft={setAvatarDraft}
        onCancel={() => setIsAvatarModalVisible(false)}
        onSave={() => {
          const trimmed = avatarDraft.trim();
          if (!isValidAvatarUrl(trimmed)) {
            Toast.show({ text1: "Invalid URL format", type: "error" });
            return;
          }

          setValue("avatarUrl", trimmed);
          setDisplayAvatarUrl(trimmed);
          setIsAvatarModalVisible(false);
        }}
      />

    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;