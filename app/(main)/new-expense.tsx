import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'
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
import { PaymentMethod } from '@/types/data/paymentMethod';
import { getAllPaymentMethods } from '@/data/paymentMethods';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewExpense() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const db = useSQLiteContext();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    (async () => {
      setAccounts(await getAllAccounts(db));
      setCategories(await getAllCategories(db));
      setPaymentMethods(await getAllPaymentMethods(db));
    })();
  }, [db]);

  return (
    <SafeAreaView>
      <ScrollView className="px-4">
        <View className="mb-8">
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

        <View className="w-full mb-8">
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

        <View className="mb-8">
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

        <View className="flex-row mb-8">
          <View className="flex-1 mr-4">
            <Text className="text-2xl font-bold">Expense date</Text>

              <TouchableOpacity
                onPress={() => setShowDateSelection(true)}
                className="bg-theme-surface py-4 px-4 rounded-md flex-row items-center gap-2"
              >
                <MaterialCommunityIcons name="calendar" size={20} />
                <Text className="text-xl">{ selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) } </Text>
              </TouchableOpacity>
            { showDateSelection ?
              <DateTimePicker
                display="calendar"
                mode="date"
                value={selectedDate}
                onValueChange={(_, value) => {
                  setSelectedDate(value);
                  setShowDateSelection(false);
                }}
                onDismiss={() => setShowDateSelection(false)}
                maximumDate={new Date()}
              /> : <></> }
          </View>

          <View className="flex-1 ml-4">
            <Text className="text-2xl font-bold">Expense time</Text>

              <TouchableOpacity
                onPress={() => setShowTimeSelection(true)}
                className="bg-theme-surface py-4 px-4 rounded-md flex-row items-center gap-2"
              >
                <MaterialCommunityIcons name="clock" size={20} />
                <Text className="text-xl">{ selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } </Text>
              </TouchableOpacity>
            { showTimeSelection ?
              <DateTimePicker
                display="clock"
                mode="time"
                value={selectedTime}
                onValueChange={(_, value) => {
                  setSelectedTime(value);
                  setShowTimeSelection(false);
                }}
                onDismiss={() => setShowTimeSelection(false)}
              /> : <></> }
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-2xl font-bold">Description</Text>

          <TextInput
              placeholder='Enter description'
              placeholderTextColor={colors.text}
              value={description}
              onChangeText={setDescription}
              multiline
              className="w-full min-h-72  text-xl rounded-md bg-theme-surface text-theme-text"
            />
        </View>

        <View className="py-20" />
      </ScrollView>
    </SafeAreaView>
  )
}