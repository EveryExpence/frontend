import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { Account } from "@/types/data/account";
import { Category } from "@/types/data/category";
import { PaymentMethod } from "@/types/data/paymentMethod";
import { Coordinates } from "@/types/data/location";

import { getExpenseRecordById } from "@/data/expenseRecords";
import { getAllAccounts } from "@/data/accounts";
import { getAllCategories } from "@/data/categories";
import { getAllPaymentMethods } from "@/data/paymentMethods";

import Topbar from "@/components/Topbar";
import AccountSelection from "@/components/new-expense/AccountSelection";
import AmountInput from "@/components/new-expense/AmountInput";
import CategorySelection from "@/components/new-expense/CategorySelection";
import PaymentMethodSelection from "@/components/new-expense/PaymentMethodSelection";
import DateTimeSelection from "@/components/new-expense/DateTimeSelection";
import DescriptionInput from "@/components/new-expense/DescriptionInput";
import LocationSelection from "@/components/new-expense/LocationMap";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RecordDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      try {
        const record = await getExpenseRecordById(db, id);
        if (!record) return;

        const accounts = await getAllAccounts(db);
        const categories = await getAllCategories(db);
        const methods = await getAllPaymentMethods(db);

        const account = accounts.find((a) => a.id === record.accountId) || null;
        const category =
          categories.find((c) => c.id === record.categoryId) || null;
        const method =
          methods.find((m) => m.id === record.paymentMethodId) || null;

        setSelectedAccount(account);
        setSelectedCategory(category);
        setSelectedPaymentMethod(method);
        setAmount(Math.abs(record.amount).toString());
        setDescription(record.description || "");
        setSelectedDateTime(new Date(record.createdAt || Date.now()));

        if (record.location) {
          const [lat, lng] = record.location.split(";");
          if (lat && lng) {
            setLocation({
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id, db]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-theme-background">
        <Topbar title="Record Details" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <Topbar title="Record Details" />
      <ScrollView className="px-4 mt-4" scrollEnabled={scrollEnabled}>
        <AccountSelection
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          disabled={true}
        />

        <AmountInput
          selectedAccount={selectedAccount}
          amount={amount}
          setAmount={setAmount}
          isValid={true}
          disabled={true}
        />

        <CategorySelection
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          disabled={true}
        />

        <PaymentMethodSelection
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          disabled={true}
        />

        <DateTimeSelection
          selectedDateTime={selectedDateTime}
          setSelectedDateTime={setSelectedDateTime}
          disabled={true}
        />

        <DescriptionInput
          description={description}
          setDescription={setDescription}
          disabled={true}
        />

        {(location || location === null) && (
          <LocationSelection
            location={location}
            setLocation={setLocation}
            setScrollEnabled={setScrollEnabled}
            disabled={true}
          />
        )}

        <View className="py-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
