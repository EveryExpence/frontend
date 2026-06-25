import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
  import { createAccount,
  deleteAccount,
  getAllAccounts,
  updateAccount,
} from '@/data/accounts';
import { useAccountsData } from '@/hooks/use-account-data';
import AccountCard, { AccountCardItem } from '@/components/accounts/AccountCard';
import AccountFormModal, { AccountFormData } from '@/components/accounts/AccountFormModal';
import DeleteAccountModal from '@/components/accounts/DeleteAccountModal';
import AccountsSectionTabs from '@/components/accounts/AccountsSectionTabs';
import { formatBalance } from '@/utils/balance';
import Topbar from '@/components/Topbar';
import { useFocusEffect } from 'expo-router';
import { useSync } from '@/context/syncContext';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/context/themeContext';

export default function AccountsScreen() {
  const { t } = useTranslation();
  const { triggerSync } = useSync();
  const db = useSQLiteContext();
  const { theme } = useTheme();
  const colors = Colors[theme];

  const { accounts: rawAccounts, loading: isLoading, refetch: loadAccounts } = useAccountsData();

  const accounts: AccountCardItem[] = React.useMemo(() => rawAccounts.map((a: any) => ({
    id: a.id,
    name: a.name,
    balance: formatBalance(a.computedBalance),
    initialBalance: formatBalance(a.balance),
    currency: a.currency,
  })), [rawAccounts]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountCardItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<AccountCardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        Toast.show({ text1: t("accounts.update_success"), type: 'success' });
      } else {
        await createAccount(db, data);
        Toast.show({ text1: t("accounts.create_success"), type: 'success' });
      }
      setIsFormOpen(false);
      await loadAccounts();
      triggerSync();
    } catch (e) {
      Toast.show({ text1: `${e}`, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    setIsDeleting(true);
    try {
      await deleteAccount(db, deletingAccount.id);
      Toast.show({ text1: t("accounts.delete_success"), type: 'success' });
      setIsDeleteOpen(false);
      setDeletingAccount(null);
      await loadAccounts();
      triggerSync();
    } catch (e) {
      Toast.show({ text1: `${e}`, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <Topbar title={t("accounts.title")} />
      <View className="px-4 pt-2">
        <AccountsSectionTabs />
      </View>
      <View className="flex-1 px-4 pt-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={32} color={colors.tint} />
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={<Text className="pt-4 text-lg text-theme-icon mb-4">{t("accounts.no_accounts")}</Text>}
            renderItem={({ item, index }) => (
              <AccountCard
                item={item}
                index={index}
                onEdit={() => openEdit(item)}
                onDelete={() => openDelete(item)}
              />
            )}
            ListFooterComponent={
              <View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  className="w-full flex-row items-center justify-center py-4 bg-theme-tint rounded-lg mt-4"
                  onPress={openAdd}
                >
                  <MaterialCommunityIcons name="plus" size={22} color={colors.textLight} style={{ marginRight: 8 }} />
                  <Text className="text-xl font-semibold text-theme-textLight">{t("accounts.add_new")}</Text>
                </TouchableOpacity>
                <View className="py-20" />
              </View>
            }
          />
        )}
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