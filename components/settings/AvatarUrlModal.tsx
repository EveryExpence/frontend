import React, { useState } from "react";
import { Modal, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from "@/utils/apiFetch";
import { uploadFileEndpoint } from "@/constants/endpoints";

type AvatarUrlModalProps = {
  visible: boolean;
  avatarDraft: string;
  onChangeDraft: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

const AvatarUrlModal = ({
  visible,
  avatarDraft,
  onChangeDraft,
  onCancel,
  onSave,
}: AvatarUrlModalProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsUploading(true);
      try {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
            uri: asset.uri,
            name: 'avatar.jpg',
            type: 'image/jpeg'
        } as any);

        const uploadRes = await apiFetch(uploadFileEndpoint, {
            method: 'POST',
            body: formData,
        });

        if (uploadRes.ok) {
            const data = await uploadRes.json();
            onChangeDraft(data.url);
        } else {
            console.error("Failed to upload image");
        }
      } catch (e) {
        console.error("Error uploading avatar", e);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full rounded-lg bg-theme-surface p-5">
          <Text className="text-2xl mb-3 text-theme-text">Change avatar</Text>

          <TextInput
            value={avatarDraft}
            placeholder="https://..."
            className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
            onChangeText={onChangeDraft}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity 
            className="mt-4 p-4 rounded-md bg-theme-background border border-theme-text items-center justify-center"
            onPress={handlePickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-lg text-theme-text">Upload from Device</Text>
            )}
          </TouchableOpacity>

          <View className="mt-4 flex-row justify-end gap-3">
            <TouchableOpacity
              className="px-4 py-3 rounded-md bg-theme-background"
              onPress={onCancel}
            >
              <Text className="text-lg text-theme-text">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-4 py-3 rounded-md bg-theme-tint"
              onPress={onSave}
            >
              <Text className="text-lg text-theme-textLight">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AvatarUrlModal;
