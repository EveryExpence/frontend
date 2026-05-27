import React from 'react';
import { Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import CustomModal from '@/components/Modal';

type Props = {
  visible: boolean;
  name?: string | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeletePaymentMethodModal({
  visible,
  name,
  isDeleting = false,
  onClose,
  onConfirm,
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <CustomModal
      isVisible={visible}
      setIsVisible={(next) => {
        if (!next) onClose();
      }}
      title="Delete payment method"
      cancelAction={
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <Text className="text-2xl text-theme-icon">Cancel</Text>
        </TouchableOpacity>
      }
      confirmAction={
        <TouchableOpacity
          onPress={onConfirm}
          disabled={isDeleting}
          style={{ marginLeft: 10, padding: 8, backgroundColor: colors.error, borderRadius: 8 }}
        >
          <Text className="text-2xl" style={{ color: colors.textLight }}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Text>
        </TouchableOpacity>
      }
    >
      <Text className="text-2xl text-theme-icon" style={{ marginBottom: 4 }}>
        Delete {name ?? ''}?
      </Text>
    </CustomModal>
  );
}