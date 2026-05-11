import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import CustomModal from '@/components/Modal';
import AppIcon from '@/components/AppIcon';
import CurrencyDropdown from '@/components/balances/CurrencyDropdown';
import { isValidBalanceInput } from '@/utils/balance';

type Props = {
  visible: boolean;
  mode: 'add' | 'edit';
  name: string;
  balance: string;
  currency: string;
  currencies: string[];
  isSaving?: boolean;
  onClose: () => void;
  onChangeName: (v: string) => void;
  onChangeBalance: (v: string) => void;
  onChangeCurrency: (v: string) => void;
  onSave: () => void;
};

export default function AccountFormModal({
  visible,
  mode,
  name,
  balance,
  currency,
  currencies,
  isSaving = false,
  onClose,
  onChangeName,
  onChangeBalance,
  onChangeCurrency,
  onSave,
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const isBalanceValid = isValidBalanceInput(balance);
  const canSave = name.trim() && isBalanceValid && !isSaving;

  React.useEffect(() => {
    if (!visible) {
      setPickerOpen(false);
    }
  }, [visible]);

  const handleSave = () => {
    if (!canSave) return;
    onSave();
  };

  return (
    <>
      <CustomModal
        isVisible={visible}
        setIsVisible={(next) => {
          if (!next) onClose();
        }}
        title={mode === 'add' ? 'Add account' : 'Edit account'}
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
          <Text className="text-2xl text-theme-icon" style={{ marginBottom: 6 }}>Name</Text>
          <TextInput
            className="text-2xl text-theme-text"
            value={name}
            onChangeText={onChangeName}
            placeholder="My wallet"
            placeholderTextColor={colors.icon}
            style={{
              backgroundColor: colors.background,
              padding: 10,
              borderRadius: 6,
              marginBottom: 12,
            }}
          />

          <Text className="text-2xl text-theme-icon" style={{ marginBottom: 6 }}>Balance</Text>
          <TextInput
            className="text-2xl text-theme-text"
            value={balance}
            onChangeText={onChangeBalance}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.icon}
            style={{
              backgroundColor: colors.background,
              color: isBalanceValid || !balance ? colors.text : colors.error,
              padding: 10,
              borderRadius: 6,
              marginBottom: balance && !isBalanceValid ? 4 : 12,
            }}
          />
          {balance && !isBalanceValid && (
            <Text style={{ color: colors.error, fontSize: 12, marginBottom: 8 }}>
              Balance must be a valid positive number
            </Text>
          )}

          <Text className="text-2xl text-theme-icon" style={{ marginBottom: 6 }}>Currency</Text>
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            style={{
              padding: 12,
              backgroundColor: colors.background,
              borderRadius: 6,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text className="text-2xl text-theme-text">{currency}</Text>
            <AppIcon name="chevron-down" size={18} color={colors.icon} />
          </TouchableOpacity>
        </ScrollView>
      </CustomModal>

      <CurrencyDropdown
        visible={pickerOpen}
        value={currency}
        options={currencies}
        onClose={() => setPickerOpen(false)}
        onSelect={onChangeCurrency}
      />
    </>
  );
}