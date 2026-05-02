import { Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Dropdown } from 'react-native-element-dropdown';
import { useSQLiteContext } from 'expo-sqlite';
import { Account } from '@/types/data/account';
import { getAllAccounts } from '@/data/accounts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Category } from '@/types/data/category';
import { getAllCategories } from '@/data/categories';

export default function NewExpense() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const db = useSQLiteContext();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    (async () => {
      setAccounts(await getAllAccounts(db));
      setCategories(await getAllCategories(db));
    })();
  }, [db]);

  return (
    <SafeAreaView className="px-4 flex flex-col gap-8">
      <View>
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
          searchPlaceholder="Search account..."
          value={selectedAccount ?? undefined}
          onChange={item => setSelectedAccount(item)}
          renderLeftIcon={() => (
            <MaterialCommunityIcons
              className="mr-6"
              name="bank"
              size={24}
            />
          )}
          renderRightIcon={() => (
            <MaterialCommunityIcons
              name="chevron-down"
              size={24}
            />
          )}
        />
      </View>

      <View className="w-full">
        <Text className="text-2xl font-bold">Amount</Text>

        <View className="w-full flex flex-row items-center">
          <MaterialCommunityIcons
            name="cash"
            size={24}
            color={colors.text}
            className="absolute left-4 text-theme-icon z-50"
          />
          <TextInput
            placeholder='Enter amount'
            placeholderTextColor={colors.text}
            value={amount}
            onChangeText={setAmount}
            className={`w-full py-4 pl-12 text-xl rounded-md bg-theme-surface text-theme-text
              ${amount != "" && selectedAccount !== null ? 'pr-12' : 'pr-4'}`}
          />
          {
            amount != "" && selectedAccount !== null ?
              <Text className="absolute text-xl right-4">{selectedAccount.currency}</Text> : <></>
          }
        </View>
      </View>

      <View>
        <Text className="text-2xl font-bold">Category</Text>

        <View className="flex-row justify-between items-center gap-2">
          <Dropdown
            style={{
              backgroundColor: colors.surface,
              padding: 12,
              borderRadius: 6,
              flex: 1,
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
            data={categories}
            search
            maxHeight={300}
            labelField="name"
            valueField="id"
            placeholder="Select category"
            searchPlaceholder="Search category..."
            value={selectedCategory ?? undefined}
            onChange={item => setSelectedCategory(item)}
            renderLeftIcon={() => (
              <MaterialCommunityIcons
                className="mr-6"
                name="chart-waterfall"
                size={24}
              />
            )}
            renderRightIcon={() => (
              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
              />
            )}
          />

          <TouchableOpacity>
            <MaterialCommunityIcons name="plus" size={32} />
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  )
}