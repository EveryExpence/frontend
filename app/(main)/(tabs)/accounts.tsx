import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import {
  createAccount,
  deleteAccount,
  getAllAccounts,
  updateAccount,
} from '@/data/accounts';
import AccountCard, { AccountCardItem } from '@/components/accounts/AccountCard';
import AccountFormModal, { AccountFormData } from '@/components/accounts/AccountFormModal';
import DeleteAccountModal from '@/components/accounts/DeleteAccountModal';
import { formatBalance } from '@/utils/balance';
import Topbar from '@/components/Topbar';
import { useFocusEffect } from 'expo-router';

export default function AccountsScreen() {
  const db = useSQLiteContext();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [accounts, setAccounts] = useState<AccountCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountCardItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<AccountCardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllAccounts(db);
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
      Toast.show({ text1: `Failed to load accounts: ${e}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  const openAdd = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: AccountCardItem) => {
    setEditingAccount(item);
    setIsFormOpen(true);
  };

  const openDelete = (item: AccountCardItem) => {
    setDeletingAccount(item);
    setIsDeleteOpen(true);
  };

  const handleSave = async (data: AccountFormData) => {
    try {
      if (editingAccount) {
        await updateAccount(db, editingAccount.id, data);
        Toast.show({ text1: 'Account updated', type: 'success' });
      } else {
        await createAccount(db, data);
        Toast.show({ text1: 'Account created', type: 'success' });
      }
      setIsFormOpen(false);
      await loadAccounts();
    } catch (e) {
      Toast.show({ text1: `${e}`, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    setIsDeleting(true);
    try {
      await deleteAccount(db, deletingAccount.id);
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
      <Topbar title="Accounts" />
      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={32} color={colors.tint} />
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
            ListEmptyComponent={<Text className="pt-4 text-lg text-theme-icon">No accounts yet</Text>}
            renderItem={({ item }) => (
              <AccountCard
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => openDelete(item)}
              />
            )}
          />
        )}
      </View>

      <View
        pointerEvents="box-none"
        className="absolute left-4 right-4 bottom-28"
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
        editingAccount={editingAccount}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />

      <DeleteAccountModal
        visible={isDeleteOpen}
        name={deletingAccount?.name}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}
