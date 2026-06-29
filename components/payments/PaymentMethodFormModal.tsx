import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import CustomModal from '@/components/Modal';
import IconPicker from '@/components/IconPicker';
import { PaymentMethodCardItem } from '@/components/payments/PaymentMethodCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

export type PaymentMethodFormData = {
  name: string;
  icon: string;
};

type Props = {
  visible: boolean;
  editingPaymentMethod: PaymentMethodCardItem | null;
  onClose: () => void;
  onSave: (data: PaymentMethodFormData) => Promise<void>;
};

export default function PaymentMethodFormModal({
  visible,
  editingPaymentMethod,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('cash');
  const [isSaving, setIsSaving] = useState(false);

  const PRESET_ICONS = [
      "cash", "credit-card", "credit-card-outline", "bank-transfer", 
      "checkbook", "wallet", "contactless-payment", "bitcoin", "cellphone-nfc"
  ];

  const isEditing = editingPaymentMethod !== null;
  const canSave = name.trim() && !isSaving;

  useEffect(() => {
    if (!visible) { return; }

    if (editingPaymentMethod) {
      setName(editingPaymentMethod.name);
      setIcon(editingPaymentMethod.icon || 'cash');
    } else {
      setName('');
      setIcon('cash');
    }
  }, [visible, editingPaymentMethod]);

  const handleSave = async () => {
    if (!canSave) { return; }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), icon });
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
      title={isEditing ? t("payments.edit_payment_method") : t("payments.add_payment_method")}
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
          {t("payments.name")}
        </Text>
        <TextInput
          className="text-lg text-theme-text"
          value={name}
          onChangeText={setName}
          placeholder={t("payments.new_payment_method_placeholder")}
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
      </ScrollView>
    </CustomModal>
  );
}