import { Text, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Dropdown } from 'react-native-element-dropdown';
import { useSQLiteContext } from 'expo-sqlite';
import { Account } from '@/types/data/account';
import { getAllAccounts } from '@/data/accounts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function NewExpense() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const db = useSQLiteContext();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    (async () => {
      setAccounts(await getAllAccounts(db));
    })();
  }, [db]);

  return (
    <SafeAreaView className="px-4">
      <View className="flex flex-col gap-4">
        <Text className="text-2xl font-bold">Account</Text>

        <Dropdown
          style={{
            backgroundColor: colors.surface,
            padding: 12,
            borderRadius: 6,
          }}
          selectedTextStyle={{
            fontSize: 18,
          }}
          placeholderStyle={{
            fontSize: 18,
          }}
          inputSearchStyle={{
            fontSize: 18,
          }}
          data={accounts}
          search
          maxHeight={300}
          labelField="name"
          valueField="id"
          placeholder="Select account"
          searchPlaceholder="Search..."
          value={selectedAccount ?? undefined}
          onChange={item => setSelectedAccount(item)}
          renderLeftIcon={() => (
            <MaterialCommunityIcons
              className="mr-6"
              name="bank"
              size={32}
            />
          )}
          renderRightIcon={() => (
            <MaterialCommunityIcons
              name="chevron-down"
              size={32}
            />
          )}
        />
      </View>
    </SafeAreaView>
  )
}