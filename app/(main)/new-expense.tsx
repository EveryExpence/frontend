import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Account } from '@/types/data/account';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Category } from '@/types/data/category';
import { PaymentMethod } from '@/types/data/paymentMethod';
import AccountSelection from '@/components/new-expense/AccountSelection';
import AmountInput from '@/components/new-expense/AmountInput';
import CategorySelection from '@/components/new-expense/CategorySelection';
import PaymentMethodSelection from '@/components/new-expense/PaymentMethodSelection';
import DateTimeSelection from '@/components/new-expense/DateTimeSelection';

export default function NewExpense() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [description, setDescription] = useState("");

  return (
    <SafeAreaView>
      <ScrollView className="px-4">
        <AccountSelection selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />

        <AmountInput selectedAccount={selectedAccount} />

        <CategorySelection selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

        <PaymentMethodSelection selectedPaymentMethod={selectedPaymentMethod} setSelectedPaymentMethod={setSelectedPaymentMethod} />

        <DateTimeSelection selectedDateTime={selectedDateTime} setSelectedDateTime={setSelectedDateTime} />

        <View className="mb-8">
          <Text className="text-2xl font-bold">Description</Text>

          <TextInput
            placeholder='Enter description'
            placeholderTextColor={colors.text}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            className="w-full min-h-36 text-xl rounded-md bg-theme-surface text-theme-text px-4 py-6"
          />
        </View>

        <View className="py-20" />
      </ScrollView>
    </SafeAreaView>
  )
}