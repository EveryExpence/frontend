import React from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CurrencyDropdown from './CurrencyDropdown';

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

const validateBalance = (value: string): boolean => {
  if (!value.trim()) return false;
  const num = Number(value.replace(/\s/g, '').replace(',', '.'));
  return !isNaN(num);
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

  const isBalanceValid = validateBalance(balance);
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
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-start',
            paddingTop: 48,
            paddingHorizontal: 16,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <Text className="text-3xl font-semibold text-theme-text" style={{ marginBottom: 12 }}>
                {mode === 'add' ? 'Add account' : 'Edit account'}
              </Text>

              <Text className="text-2xl text-theme-icon" style={{ marginBottom: 6 }}>Name</Text>
              <TextInput className="text-2xl text-theme-text"
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
              <TextInput className="text-2xl text-theme-text"
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
                <MaterialCommunityIcons name="chevron-down" size={18} style={{ color: colors.icon }} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
                  <Text className="text-2xl text-theme-icon">Cancel</Text>
                </TouchableOpacity>

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
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

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