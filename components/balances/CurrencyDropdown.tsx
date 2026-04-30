import React from 'react';
import { FlatList, Modal, Pressable, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

type Props = {
  value: string;
  options: string[];
  visible: boolean;
  onClose: () => void;
  onSelect: (c: string) => void;
};

export default function CurrencyDropdown({ value, options, visible, onClose, onSelect }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: 6, padding: 12, maxHeight: '70%' }}>
          <Text className = "text-3xl font-semibold text-theme-text" style={{ marginBottom: 10 }}>Select currency</Text>
          <FlatList
            data={options}
            keyExtractor={(i) => i}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { onSelect(item); onClose(); }}
                style={{ paddingVertical: 12, paddingHorizontal: 8 }}
              >
                <Text className = "text-2xl" style={{ color: item === value ? colors.tint : colors.text }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}