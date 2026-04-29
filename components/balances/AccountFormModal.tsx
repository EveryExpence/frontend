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

  React.useEffect(() => {
    if (!visible) {
      setPickerOpen(false);
    }
  }, [visible]);

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-start',
            paddingTop: 48,
            paddingHorizontal: 16,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text className="text-2xl font-semibold text-theme-text" style={{ marginBottom: 12 }}>
                {mode === 'add' ? 'Add account' : 'Edit account'}
              </Text>

              <Text style={{ color: colors.icon, marginBottom: 6 }}>Name</Text>
              <TextInput className="text-l text-theme-text"
                value={name}
                onChangeText={onChangeName}
                placeholder="My wallet"
                placeholderTextColor={colors.icon}
                style={{
                  backgroundColor: colors.background,
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />

              <Text className="text-l text-theme-icon" style={{ marginBottom: 6 }}>Balance</Text>
              <TextInput className="text-l text-theme-text"
                value={balance}
                onChangeText={onChangeBalance}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.icon}
                style={{
                  backgroundColor: colors.background,
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />

              <Text className="text-l text-theme-icon" style={{ marginBottom: 6 }}>Currency</Text>
              <TouchableOpacity
                onPress={() => setPickerOpen(true)}
                style={{
                  padding: 12,
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Text className="text-l text-theme-text">{currency}</Text>
                <MaterialCommunityIcons name="chevron-down" size={18} style={{ color: colors.icon }} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
                  <Text className="text-l text-theme-icon">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onSave}
                  disabled={isSaving}
                  style={{
                    marginLeft: 8,
                    padding: 10,
                    backgroundColor: colors.tint,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: colors.textLight }}>
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