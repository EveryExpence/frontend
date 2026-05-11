import React from 'react';
import { FlatList, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Colors } from '@/constants/theme';
import CustomModal from '@/components/Modal';

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
    <CustomModal
      isVisible={visible}
      setIsVisible={(next) => {
        if (!next) onClose();
      }}
      title="Select currency"
      cancelAction={
        <TouchableOpacity onPress={onClose}>
          <Text className="text-xl text-theme-text">Close</Text>
        </TouchableOpacity>
      }
      confirmAction={null}
    >
      <View style={{ maxHeight: '70%' }}>
        <FlatList
          data={options}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              style={{ paddingVertical: 12, paddingHorizontal: 8 }}
            >
              <Text className="text-2xl" style={{ color: item === value ? colors.tint : colors.text }}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </CustomModal>
  );
}
