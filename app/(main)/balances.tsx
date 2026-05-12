import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import {
  createAccount as createLocalAccount,
  deleteAccount as deleteLocalAccount,
  getAllAccounts as getAllLocalAccounts,
  updateAccount as updateLocalAccount,
} from '@/data/accounts';
import AccountCard, { AccountCardItem } from '@/components/accounts/AccountCard';
import AccountFormModal from '@/components/accounts/AccountFormModal';
import DeleteAccountModal from '@/components/accounts/DeleteAccountModal';
import { formatBalance, normalizeNumberInput, parseBalanceInput } from '@/utils/balance';

const BOTTOM_NAV_HEIGHT = 84;
const FLOATING_BUTTON_HEIGHT = 56;
const FLOATING_BUTTON_GAP = 12;
const LIST_BOTTOM_GAP = 16;
const CORNER_RADIUS = 6;

const CURRENCIES = ['USD', 'EUR', 'PLN', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
const DEFAULT_CURRENCY = CURRENCIES[0];

export default function Balances() {
  const db = useSQLiteContext();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

  const [accounts, setAccounts] = useState<AccountCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingAccount, setEditingAccount] = useState<AccountCardItem | null>(null);
  const [name, setName] = useState('');
  const [balanceField, setBalanceField] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<AccountCardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fixedButtonBottom = insets.bottom + BOTTOM_NAV_HEIGHT + FLOATING_BUTTON_GAP;
  const listBottomPadding = fixedButtonBottom + FLOATING_BUTTON_HEIGHT + LIST_BOTTOM_GAP;

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllLocalAccounts(db);
      setAccounts(
        data.map((a) => ({
          id: a.id,
          name: a.name,
          balance: formatBalance(a.balance),
          currency: a.currency,
        }))
      );
    } catch (e) {
      setAccounts([]);
      Toast.show({ text1: `Failed to load local accounts: ${e}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openAdd = () => {
    setFormMode('add');
    setEditingAccount(null);
    setName('');
    setBalanceField('');
    setCurrency(DEFAULT_CURRENCY);
    setIsFormOpen(true);
  };

  const openEdit = (item: AccountCardItem) => {
    setFormMode('edit');
    setEditingAccount(item);
    setName(item.name);
    setBalanceField(normalizeNumberInput(String(item.balance)));
    setCurrency(item.currency ?? DEFAULT_CURRENCY);
    setIsFormOpen(true);
  };

  const openDelete = (item: AccountCardItem) => {
    setDeletingAccount(item);
    setIsDeleteOpen(true);
  };

  const submitForm = async () => {
    if (!name.trim()) {
      Toast.show({ text1: 'Name is required', type: 'error' });
      return;
    }

    const parsed = parseBalanceInput(balanceField);
    if (!Number.isFinite(parsed)) {
      Toast.show({ text1: 'Balance must be a valid number', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (formMode === 'add') {
        await createLocalAccount(db, {
          name: name.trim(),
          currency,
          balance: parsed,
        });
        Toast.show({ text1: 'Account created', type: 'success' });
      } else if (editingAccount) {
        await updateLocalAccount(db, editingAccount.id, {
          name: name.trim(),
          currency,
          balance: parsed,
        });
        Toast.show({ text1: 'Account updated', type: 'success' });
      }

      setIsFormOpen(false);
      await loadAccounts();
    } catch (e) {
      Toast.show({ text1: `${e}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingAccount) return;

    setIsDeleting(true);
    try {
      await deleteLocalAccount(db, deletingAccount.id);
      Toast.show({ text1: 'Account deleted', type: 'success' });
      setIsDeleteOpen(false);
      setDeletingAccount(null);
      await loadAccounts();
    } catch (e) {
      Toast.show({ text1: `${e}`, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <View className="flex-1 px-4 pt-4">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-theme-text">Your accounts</Text>
          <Text className="text-xl font-semibold text-theme-tint">{accounts.length} Total accounts</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={32} color={colors.tint} />
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: listBottomPadding }}
            ListEmptyComponent={<Text className="pt-4 text-lg text-theme-icon">No accounts yet</Text>}
            renderItem={({ item }) => (
              <AccountCard
                item={item}
                cornerRadius={CORNER_RADIUS}
                onEdit={() => openEdit(item)}
                onDelete={() => openDelete(item)}
              />
            )}
          />
        )}
      </View>

      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 16, right: 16, bottom: fixedButtonBottom }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          className="w-full flex-row items-center justify-center py-4 bg-theme-tint rounded-lg"
          onPress={openAdd}
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.textLight} style={{ marginRight: 8 }} />
          <Text className="text-xl font-semibold text-theme-textLight">Add new account</Text>
        </TouchableOpacity>
      </View>

      <AccountFormModal
        visible={isFormOpen}
        mode={formMode}
        name={name}
        balance={balanceField}
        currency={currency}
        currencies={CURRENCIES}
        isSaving={isSubmitting}
        onClose={() => setIsFormOpen(false)}
        onChangeName={setName}
        onChangeBalance={setBalanceField}
        onChangeCurrency={setCurrency}
        onSave={submitForm}
      />

      <DeleteAccountModal
        visible={isDeleteOpen}
        name={deletingAccount?.name}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}