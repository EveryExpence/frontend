import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Colors } from '@/constants/theme';
import CustomModal from '@/components/Modal';
import IconPicker from '@/components/IconPicker';
import { CategoryCardItem } from '@/components/categories/CategoryCard';
import { categoryTypes } from '@/types/data/category';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

export type CategoryFormData = {
  name: string;
  type: 'expense' | 'income' | 'varies';
  icon: string;
};

type Props = {
  visible: boolean;
  editingCategory: CategoryCardItem | null;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
};

export default function CategoryFormModal({ visible, editingCategory, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [name, setName] = useState('');
  const [typeIndex, setTypeIndex] = useState(0);
  const [icon, setIcon] = useState('label-outline');
  const [isSaving, setIsSaving] = useState(false);

  const PRESET_ICONS = [
      "food-fork-drink", "car", "home", "lightning-bolt", "cart", 
      "gamepad-variant", "cash-multiple", "briefcase", "chart-line", 
      "gift", "medical-bag", "school", "tag-outline", "label-outline", "dots-horizontal"
  ];

  const isEditing = editingCategory !== null;
  const canSave = name.trim() && !isSaving;

  useEffect(() => {
    if (!visible) { return; }

    if (editingCategory) {
      setName(editingCategory.name);
      setTypeIndex(Math.max(0, categoryTypes.indexOf(editingCategory.type.toLowerCase() as any)));
      setIcon(editingCategory.icon || 'label-outline');
    } else {
      setName('');
      setTypeIndex(0);
      setIcon('label-outline');
    }
  }, [visible, editingCategory]);

  const handleSave = async () => {
    if (!canSave) { return; }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), type: categoryTypes[typeIndex], icon });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomModal
      isVisible={visible}
      setIsVisible={(next) => {
        if (!next) { onClose(); }
      }}
      title={isEditing ? t("categories.edit_category") : t("categories.add_category")}
      cancelAction={
        <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
          <Text className="text-lg text-theme-icon">{t("common.cancel")}</Text>
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
          <Text className="text-lg font-medium" style={{ color: colors.textLight }}>
            {isSaving ? t("common.loading") : t("common.save")}
          </Text>
        </TouchableOpacity>
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text className="text-lg text-theme-icon" style={{ marginBottom: 6 }}>
          {t("categories.name")}
        </Text>
        <TextInput
          className="text-lg text-theme-text"
          value={name}
          onChangeText={setName}
          placeholder={t("categories.new_category_placeholder")}
          placeholderTextColor={colors.icon}
          style={{
            backgroundColor: colors.background,
            padding: 10,
            borderRadius: 6,
            marginBottom: 12,
          }}
        />

        <Text className="text-lg text-theme-icon" style={{ marginBottom: 6 }}>
          Icon
        </Text>
        <IconPicker 
          icons={PRESET_ICONS}
          selectedIcon={icon}
          onSelect={setIcon}
        />

        <Text className="text-lg text-theme-icon" style={{ marginBottom: 6 }}>
          {t("categories.type")}
        </Text>
        <SegmentedControl
          tintColor={colors.tint}
          fontStyle={{ color: colors.text }}
          activeFontStyle={{ color: colors.textLight }}
          backgroundColor={colors.surface}
          style={{ height: 36 }}
          values={categoryTypes.map(type => t(`categories.type_${type}`))}
          selectedIndex={typeIndex}
          onChange={(event) => {
            setTypeIndex(event.nativeEvent.selectedSegmentIndex);
          }}
        />
      </ScrollView>
    </CustomModal>
  );
}