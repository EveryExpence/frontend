import React from 'react';
import { Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import CustomModal from '@/components/Modal';
import { useTranslation } from 'react-i18next';

type Props = {
  visible: boolean;
  title?: string | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteRecordModal({
  visible,
  title,
  isDeleting = false,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <CustomModal
      isVisible={visible}
      setIsVisible={(next) => {
        if (!next) { onClose(); }
      }}
      title={t("records.delete_record")}
      cancelAction={
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <Text className="text-lg text-theme-icon">{t("common.cancel")}</Text>
        </TouchableOpacity>
      }
      confirmAction={
        <TouchableOpacity
          onPress={onConfirm}
          disabled={isDeleting}
          style={{ marginLeft: 10, padding: 8, backgroundColor: colors.error, borderRadius: 8 }}
        >
          <Text className="text-lg font-medium" style={{ color: colors.textLight }}>
            {isDeleting ? t("common.loading") : t("common.delete")}
          </Text>
        </TouchableOpacity>
      }
    >
      <Text className="text-lg text-theme-text" style={{ marginBottom: 4 }}>
        {t("records.delete_confirm", { title: title ?? '' })}
      </Text>
    </CustomModal>
  );
}
