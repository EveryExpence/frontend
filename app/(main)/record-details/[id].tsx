import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { Account } from "@/types/data/account";
import { Category } from "@/types/data/category";
import { PaymentMethod } from "@/types/data/paymentMethod";
import { Coordinates } from "@/types/data/location";

import { getExpenseRecordById, updateExpenseRecord } from "@/data/expenseRecords";
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
import { useSync } from "@/context/syncContext";

import Toast from "react-native-toast-message";

export default function RecordDetailsScreen() {
  const { triggerSync } = useSync();
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
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);

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
      } catch (err: any) {
        console.error("Failed to load record:", err);
        const msg = err?.message ?? String(err);
        setLoadError(msg);
        Toast.show({ text1: "Failed to load record", text2: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id, db]);

  const handleSave = async () => {
    if (
      !id ||
      !selectedAccount ||
      !selectedCategory ||
      !selectedPaymentMethod ||
      !amount
    ) {
      Toast.show({ text1: "Please fill all required fields", type: "error" });
      return;
    }

    try {
      const amountValue =
        selectedCategory.type?.toLowerCase() === "income"
          ? Math.abs(parseFloat(amount))
          : -Math.abs(parseFloat(amount));

      let locationString = null;
      if (location) {
        locationString = `${location.latitude};${location.longitude}`;
      }

      await updateExpenseRecord(db, id as string, {
        amount: amountValue,
        accountId: selectedAccount.id,
        categoryId: selectedCategory.id,
        paymentMethodId: selectedPaymentMethod.id,
        description: description,
        location: locationString ? locationString : undefined,
        createdAt: selectedDateTime.getTime(),
      });
      Toast.show({ text1: "Record updated successfully", type: "success" });
      setIsEditing(false);
      triggerSync();
    } catch (e: any) {
      Toast.show({ text1: "Failed to update record", text2: e?.message ?? String(e), type: "error" });
    }
  };

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
          disabled={!isEditing}
        />

        <AmountInput
          selectedAccount={selectedAccount}
          amount={amount}
          setAmount={setAmount}
          isValid={true}
          disabled={!isEditing}
        />

        <CategorySelection
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          disabled={!isEditing}
        />

        <PaymentMethodSelection
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          disabled={!isEditing}
        />

        <DateTimeSelection
          selectedDateTime={selectedDateTime}
          setSelectedDateTime={setSelectedDateTime}
          disabled={!isEditing}
        />

        <DescriptionInput
          description={description}
          setDescription={setDescription}
          disabled={!isEditing}
        />

        {(location || location === null) && (
          <LocationSelection
            location={location}
            setLocation={setLocation}
            setScrollEnabled={setScrollEnabled}
            disabled={!isEditing}
          />
        )}

        <View className="mt-8 mb-10">
          {!isEditing ? (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="w-full bg-theme-tint py-4 rounded-md flex-row justify-center items-center"
            >
              <Text className="text-white font-bold text-lg">Edit Record</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSave}
              className="w-full bg-theme-tint py-4 rounded-md flex-row justify-center items-center"
            >
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
