import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Dropdown } from 'react-native-element-dropdown';
import { useSQLiteContext } from 'expo-sqlite';
import { Account } from '@/types/data/account';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Category } from '@/types/data/category';
import { PaymentMethod } from '@/types/data/paymentMethod';
import { getAllPaymentMethods } from '@/data/paymentMethods';
import DateTimePicker from '@react-native-community/datetimepicker';
import AccountSelection from '@/components/new-expense/AccountSelection';
import AmountInput from '@/components/new-expense/AmountInput';
import CategorySelection from '@/components/new-expense/CategorySelection';

export default function NewExpense() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const db = useSQLiteContext();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    (async () => {
      setPaymentMethods(await getAllPaymentMethods(db));
    })();
  }, [db]);

  return (
    <SafeAreaView>
      <ScrollView className="px-4">
        <AccountSelection selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />

        <AmountInput selectedAccount={selectedAccount} />

        <CategorySelection selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

        <View className="mb-8">
          <Text className="text-2xl font-bold">Payment method</Text>

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
              data={paymentMethods}
              search
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder="Select payment method"
              searchPlaceholder="Search payment method..."
              value={selectedPaymentMethod ?? undefined}
              onChange={item => setSelectedPaymentMethod(item)}
              renderLeftIcon={() => (
                <MaterialCommunityIcons
                  className="mr-6"
                  name="cash-register"
                  size={20}
                />
              )}
              renderRightIcon={() => (
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                />
              )}
            />

            <TouchableOpacity>
              <MaterialCommunityIcons name="plus" size={32} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-2xl font-bold">Expense timestamp</Text>

          <TouchableOpacity
            onPress={() => setShowDateSelection(true)}
            className="bg-theme-surface py-4 px-4 rounded-md flex-row items-center gap-2"
          >
            <MaterialCommunityIcons name="clock" size={20} />
            <Text className="text-xl">{selectedTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} </Text>
          </TouchableOpacity>

          {showDateSelection ?
            <DateTimePicker
              display="calendar"
              mode="date"
              value={selectedDate}
              onValueChange={(_, value) => {
                setSelectedDate(value);
                setShowDateSelection(false);
                setShowTimeSelection(true);
              }}
              onDismiss={() => {
                setShowDateSelection(false);
                setShowTimeSelection(true);
              }}
              maximumDate={new Date()}
            /> : <></>}

          {showTimeSelection ?
            <DateTimePicker
              display="clock"
              mode="time"
              value={selectedTime}
              onValueChange={(_, value) => {
                setSelectedTime(value);
                setShowTimeSelection(false);
              }}
              onDismiss={() => setShowTimeSelection(false)}
            /> : <></>}
        </View>

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