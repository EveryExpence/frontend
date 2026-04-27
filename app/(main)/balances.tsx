import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/theme';
import { getAccountsEndpoint } from '@/constants/endpoints';
import { apiFetch } from '@/utils/apiFetch';
import AccountCard, { AccountCardItem } from '@/components/AccountCard';

type AccountResponseDTO = {
  id: string;
  name: string;
  currency: string;
  balance: number | string;
  createdAt: string;
};

const BOTTOM_NAV_HEIGHT = 84;
const FLOATING_BUTTON_HEIGHT = 56;
const FLOATING_BUTTON_GAP = 12;
const LIST_BOTTOM_GAP = 16;
const CORNER_RADIUS = 6;

const formatBalance = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  if (Number.isFinite(numericValue)) {
    return new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  }
  return String(value);
};

export default function Balances() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

  const [accounts, setAccounts] = useState<AccountCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fixedButtonBottom = insets.bottom + BOTTOM_NAV_HEIGHT + FLOATING_BUTTON_GAP;
  const listBottomPadding = fixedButtonBottom + FLOATING_BUTTON_HEIGHT + LIST_BOTTOM_GAP;

  useEffect(() => {
    let isMounted = true;

    const loadAccounts = async () => {
      setIsLoading(true);
      try {
        const response = await apiFetch(getAccountsEndpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail ?? errorData.message ?? errorData.title ?? 'Failed to load accounts';
          throw new Error(errorMessage);
        }

        const data: AccountResponseDTO[] = await response.json();
        const mapped: AccountCardItem[] = data.map((account) => ({
          id: account.id,
          name: account.name,
          balance: formatBalance(account.balance),
          currency: account.currency,
        }));

        if (isMounted) {
          setAccounts(mapped);
        }
      } catch (error) {
        if (isMounted) {
          setAccounts([]);
        }
        Toast.show({ text1: `Failed to load accounts: ${error}`, type: 'error' });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <View className="flex-1 px-4 pt-4">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-theme-text">Your accounts</Text>
          <Text className="text-xl font-semibold text-theme-tint">
            {accounts.length} Total accounts
          </Text>
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
            ListEmptyComponent={
              <Text className="pt-4 text-lg text-theme-icon">No accounts yet</Text>
            }
            renderItem={({ item }) => (
              <AccountCard
                item={item}
                textColor={colors.text}
                surfaceColor={colors.surface}
                cornerRadius={CORNER_RADIUS}
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
          className="w-full flex-row items-center justify-center bg-theme-tint py-4"
          style={{ borderRadius: CORNER_RADIUS }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={22}
            color={colors.textLight}
            style={{ marginRight: 8 }}
          />
          <Text className="text-xl font-semibold text-theme-textLight">Add new account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}