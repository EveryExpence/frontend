import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '@/constants/theme';
import CustomModal from '@/components/Modal';
import { AccountCardItem } from '@/components/accounts/AccountCard';
import { isValidBalanceInput, normalizeNumberInput, parseBalanceInput } from '@/utils/balance';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { CURRENCIES } from '@/constants/currencies';

export type AccountFormData = {
  name: string;
  currency: string;
  balance: number;
};

type Props = {
  visible: boolean;
  editingAccount: AccountCardItem | null;
  onClose: () => void;
  onSave: (data: AccountFormData) => Promise<void>;
};

export default function AccountFormModal({ visible, editingAccount, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [name, setName] = useState('');
  const [balanceField, setBalanceField] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = editingAccount !== null;
  const isBalanceValid = balanceField.trim() === '' || isValidBalanceInput(balanceField);
  const canSave = name.trim() && isBalanceValid && !isSaving;

  const currencyOptions = React.useMemo(
    () => CURRENCIES.map((c) => ({ label: `${c.code} (${c.symbol}) - ${c.name}`, value: c.code })),
    []
  );

  useEffect(() => {
    if (!visible) { return; }

    if (editingAccount) {
      setName(editingAccount.name);
      setBalanceField(normalizeNumberInput(String(editingAccount.balance)));
      setCurrency(editingAccount.currency ?? 'USD');
    } else {
      setName('');
      setBalanceField('');
      setCurrency('USD');
    }
  }, [visible, editingAccount]);

  const handleSave = async () => {
    if (!canSave) { return; }

    const parsed = balanceField.trim() === '' ? 0 : parseBalanceInput(balanceField);
    if (!Number.isFinite(parsed)) return;

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), currency, balance: parsed });
    } catch (error: any) {
      Toast.show({ text1: error?.message || t('accounts.save_failed'), type: "error" });
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
      title={isEditing ? t("accounts.edit_account") : t("accounts.add_account")}
      cancelAction={
        <TouchableOpacity 
          accessible
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
          onPress={onClose} 
          style={{ padding: 10 }}
        >
          <Text className="text-lg text-theme-icon">{t("common.cancel")}</Text>
        </TouchableOpacity>
      }
      confirmAction={
        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel={isSaving ? t("common.loading") : t("common.save")}
          accessibilityState={{ disabled: !canSave }}
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
        <Text className="text-lg text-theme-icon" style={{ marginBottom: 6 }}>{t("accounts.name")}</Text>
        <TextInput
          accessible
          accessibilityLabel={t("accounts.name")}
          accessibilityHint="Enter account name"
          className="text-lg text-theme-text"
          value={name}
          onChangeText={setName}
          placeholder={t("accounts.enter_name_placeholder")}
          placeholderTextColor={colors.icon}
          style={{
            backgroundColor: colors.background,
            padding: 10,
            borderRadius: 6,
            marginBottom: 12,
          }}
        />

        <Text className="text-lg text-theme-icon" style={{ marginBottom: 6 }}>{t("accounts.balance")}</Text>
        <TextInput
          accessible
          accessibilityLabel={t("accounts.balance")}
          accessibilityHint={balanceField && !isBalanceValid ? "Invalid account balance" : "Enter account balance"}
          className="text-lg text-theme-text"
          value={balanceField}
          onChangeText={setBalanceField}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.icon}
          style={{
            backgroundColor: colors.background,
            color: isBalanceValid || !balanceField ? colors.text : colors.error,
            padding: 10,
            borderRadius: 6,
            marginBottom: balanceField && !isBalanceValid ? 4 : 12,
          }}
        />
        {balanceField && !isBalanceValid && (
          <Text style={{ color: colors.error, fontSize: 12, marginBottom: 8 }}>
            {t("accounts.error_balance_positive")}
          </Text>
        )}

        <Text className="text-lg text-theme-icon">{t("accounts.currency")}</Text>
        <Dropdown
          style={{
            backgroundColor: colors.background,
            padding: 12,
            borderRadius: 6,
            marginBottom: 12,
          }}
          containerStyle={{
            backgroundColor: colors.surface,
            borderColor: colors.icon,
            marginTop: -25,
          }}
          activeColor={colors.tint}
          itemTextStyle={{ color: colors.text }}
          selectedTextStyle={{
            fontSize: 17,
            color: colors.text,
          }}
          placeholderStyle={{
            fontSize: 17,
            color: colors.text,
            opacity: 0.5,
          }}
          inputSearchStyle={{
            fontSize: 17,
            color: colors.text,
          }}
          data={currencyOptions}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={t("accounts.select_currency")}
          searchPlaceholder={t("accounts.search_currency")}
          value={currency}
          onChange={(item) => setCurrency(item.value)}
          dropdownPosition="bottom"
          renderRightIcon={() => (
            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
          )}
        />
      </ScrollView>
    </CustomModal>
  );
}