import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Colors } from '@/constants/theme';
import CustomModal from '@/components/Modal';
import { CategoryCardItem } from '@/components/categories/CategoryCard';
import { categoryTypes } from '@/types/data/category';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type CategoryFormData = {
  name: string;
  type: 'expense' | 'income' | 'varies';
};

type Props = {
  visible: boolean;
  editingCategory: CategoryCardItem | null;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
};

export default function CategoryFormModal({ visible, editingCategory, onClose, onSave }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [name, setName] = useState('');
  const [typeIndex, setTypeIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = editingCategory !== null;
  const canSave = name.trim() && !isSaving;

  useEffect(() => {
    if (!visible) return;

    if (editingCategory) {
      setName(editingCategory.name);
      setTypeIndex(Math.max(0, categoryTypes.indexOf(editingCategory.type)));
    } else {
      setName('');
      setTypeIndex(0);
    }
  }, [visible, editingCategory]);

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), type: categoryTypes[typeIndex] });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomModal
      isVisible={visible}
      setIsVisible={(next) => {
        if (!next) onClose();
      }}
      title={isEditing ? 'Edit category' : 'Add category'}
      cancelAction={
        <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
          <Text className="text-2xl text-theme-icon">Cancel</Text>
        </TouchableOpacity>
      }
      confirmAction={
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          style={{
            marginLeft: 8,
            padding: 10,
            backgroundColor: canSave ? colors.tint : colors.icon,
            borderRadius: 8,
            opacity: canSave ? 1 : 0.5,
          }}
        >
          <Text className="text-2xl" style={{ color: colors.textLight }}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text className="text-2xl text-theme-icon" style={{ marginBottom: 6 }}>
          Name
        </Text>
        <TextInput
          className="text-2xl text-theme-text"
          value={name}
          onChangeText={setName}
          placeholder="New category"
          placeholderTextColor={colors.icon}
          style={{
            backgroundColor: colors.background,
            padding: 10,
            borderRadius: 6,
            marginBottom: 12,
          }}
        />

        <Text className="text-2xl text-theme-icon" style={{ marginBottom: 6 }}>
          Type
        </Text>
        <SegmentedControl
          tintColor={colors.tint}
          fontStyle={{ color: colors.text }}
          activeFontStyle={{ color: colors.textLight }}
          backgroundColor={colors.surface}
          style={{ height: 36 }}
          values={categoryTypes}
          selectedIndex={typeIndex}
          onChange={(event) => {
            setTypeIndex(event.nativeEvent.selectedSegmentIndex);
          }}
        />
      </ScrollView>
    </CustomModal>
  );
}