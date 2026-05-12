import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Account } from '@/types/data/account';
import { Category } from '@/types/data/category';
import { PaymentMethod } from '@/types/data/paymentMethod';
import AccountSelection from '@/components/new-expense/AccountSelection';
import AmountInput from '@/components/new-expense/AmountInput';
import CategorySelection from '@/components/new-expense/CategorySelection';
import PaymentMethodSelection from '@/components/new-expense/PaymentMethodSelection';
import DateTimeSelection from '@/components/new-expense/DateTimeSelection';
import DescriptionInput from '@/components/new-expense/DescriptionInput';
import { ExpenseRecordInputDTO } from '@/types/data/expenseRecord';
import { createExpenseRecord } from '@/data/expenseRecords';
import { useSQLiteContext } from 'expo-sqlite';
import Toast from 'react-native-toast-message';
import LocationSelection from '@/components/new-expense/LocationMap';
import { Coordinates } from '@/types/data/location';

export default function NewExpense() {
  const db = useSQLiteContext();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [amount, setAmount] = useState("");
  const safeAmount = (amount ?? '').toString().trim();
  const isAmountValid = safeAmount === '' || /^-?\d*\.?\d+$/.test(safeAmount);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Coordinates | null>(null);

  const saveRecord = async () => {
    if (selectedAccount === null || selectedCategory === null || selectedPaymentMethod === null || !isAmountValid) {
      Toast.show({ text1: "All required fields are needed", type: "error" });
      return;
    }
    const amountNumber = Number(amount);
    if (amountNumber === 0) {
      Toast.show({ text1: "Ammount has to be non-zero", type: "error" });
      return;
    }

    const expenseRecord: ExpenseRecordInputDTO = {
      amount: amountNumber,
      description,
      paymentMethodId: selectedPaymentMethod.id,
      categoryId: selectedCategory.id,
      accountId: selectedAccount.id,
      createdAt: selectedDateTime.getTime() / 1000,
    };

    try {
      await createExpenseRecord(db, expenseRecord);
      Toast.show({ text1: "Record was added" });
      setSelectedAccount(null);
      setSelectedCategory(null);
      setSelectedPaymentMethod(null);
      setSelectedDateTime(new Date());
      setAmount("");
      setDescription("");
    } catch {
      Toast.show({ text1: "Failed to add a new record", type: "error" });
    }
  }

  return (
    <SafeAreaView>
      <ScrollView className="px-4">
        <AccountSelection selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />

        <AmountInput selectedAccount={selectedAccount} amount={amount} setAmount={setAmount} isValid={isAmountValid} />

        <CategorySelection selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

        <PaymentMethodSelection selectedPaymentMethod={selectedPaymentMethod} setSelectedPaymentMethod={setSelectedPaymentMethod} />

        <DateTimeSelection selectedDateTime={selectedDateTime} setSelectedDateTime={setSelectedDateTime} />

        <DescriptionInput description={description} setDescription={setDescription} />

        <LocationSelection location={location} setLocation={setLocation} />

        <TouchableOpacity onPress={saveRecord} className="w-full bg-theme-tint py-4 rounded-md">
          <Text className="text-xl text-theme-textLight text-center font-bold">Save a new record</Text>
        </TouchableOpacity>

        <View className="py-20" />
      </ScrollView>
    </SafeAreaView>
  )
}