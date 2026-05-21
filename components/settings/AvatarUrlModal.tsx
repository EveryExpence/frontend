import React from "react";
import { Modal, TextInput, TouchableOpacity, View, Text } from "react-native";

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
}: AvatarUrlModalProps) => (
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

export default AvatarUrlModal;
