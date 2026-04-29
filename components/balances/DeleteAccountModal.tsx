import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

type Props = {
  visible: boolean;
  name?: string | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAccountModal({ visible, name, isDeleting = false, onClose, onConfirm }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: 6, padding: 16 }}>
          <Text className="text-l font-semibold text-theme-text" style={{ marginBottom: 8 }}>Delete account</Text>
          <Text className="text-l text-theme-icon" style={{ marginBottom: 16 }}>Delete {name ?? ''}?</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text className="text-l text-theme-icon">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} disabled={isDeleting} style={{ marginLeft: 10, padding: 8, backgroundColor: colors.error, borderRadius: 8 }}>
              <Text style={{ color: colors.textLight }}>{isDeleting ? 'Deleting...' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}