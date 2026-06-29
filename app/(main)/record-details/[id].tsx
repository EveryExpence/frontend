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
import { getAttachmentsForExpense, saveAttachments, deleteAttachmentsForExpense } from "@/data/attachments";
import { getAllAccounts } from "@/data/accounts";
import { getAllCategories } from "@/data/categories";
import { getAllPaymentMethods } from "@/data/paymentMethods";

import Topbar from "@/components/Topbar";
import AccountSelection from "@/components/new-expense/AccountSelection";
import AmountInput from "@/components/new-expense/AmountInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CategorySelection from "@/components/new-expense/CategorySelection";
import PaymentMethodSelection from "@/components/new-expense/PaymentMethodSelection";
import DateTimeSelection from "@/components/new-expense/DateTimeSelection";
import DescriptionInput from "@/components/new-expense/DescriptionInput";
import LocationSelection from "@/components/new-expense/LocationMap";
import ImageAttachmentSelection from "@/components/new-expense/ImageAttachmentSelection";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSync } from "@/context/syncContext";
import { useTranslation } from "react-i18next";
import * as FileSystem from 'expo-file-system/legacy';

import Toast from "react-native-toast-message";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCategoryIcon } from "@/types/data/category";

export default function RecordDetailsScreen() {
  const { t } = useTranslation();
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
  const [recordType, setRecordType] = useState<"expense" | "income">("expense");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) { return; }
      try {
        const record = await getExpenseRecordById(db, id);
        if (!record) { return; }

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
        
        setRecordType(record.amount >= 0 ? "income" : "expense");

        const atts = await getAttachmentsForExpense(db, record.id);
        const uris = [];
        for (const att of atts) {
          const filename = FileSystem.cacheDirectory + 'att_' + att.id + '.jpg';
          let binary = '';
          for (let i = 0; i < att.content.length; i++) {
            binary += String.fromCharCode(att.content[i]);
          }
          const base64 = btoa(binary);
          await FileSystem.writeAsStringAsync(filename, base64, { encoding: 'base64' });
          uris.push(filename);
        }
        setImages(uris);
      } catch (err: any) {
        console.error("Failed to load record:", err);
        const msg = err?.message ?? String(err);
        setLoadError(msg);
        Toast.show({ text1: t('records.load_record_failed'), text2: msg, type: "error" });
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
      Toast.show({ text1: t("new_expense.error_required"), type: "error" });
      return;
    }

    try {
      const amountValue =
        recordType === "income"
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
      await deleteAttachmentsForExpense(db, id as string);
      if (images.length > 0) {
        await saveAttachments(db, id as string, images);
      }
      Toast.show({ text1: t("records.update_success"), type: "success" });
      setIsEditing(false);
      triggerSync();
    } catch (e: any) {
      Toast.show({ text1: t("records.update_failed"), text2: e?.message ?? String(e), type: "error" });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-transparent">
        <Topbar title={t("records.record_details")} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <Topbar title={t("records.record_details")} />
      <ScrollView className="px-4 mt-4" scrollEnabled={scrollEnabled} showsVerticalScrollIndicator={false}>
        {!isEditing ? (
          <View className="mb-10">
            {/* Beautiful View Mode */}
            <Animated.View entering={FadeInDown.springify().mass(0.6).damping(14)} className="items-center mt-6 mb-8">
              <View className="w-24 h-24 rounded-full justify-center items-center mb-4 bg-theme-surface shadow-sm border border-theme-tint/10">
                <MaterialCommunityIcons 
                  name={(selectedCategory?.icon as any) || getCategoryIcon(selectedCategory?.name || "") || "cash"} 
                  size={48} 
                  color={colors.tint} 
                />
              </View>
              <Text className="text-2xl text-theme-text font-bold text-center mb-2">
                {description || selectedCategory?.name || t("records.no_description")}
              </Text>
              <Text className={`text-4xl font-bold tracking-tight ${recordType === "income" ? "text-[#208c05]" : "text-red-600"}`}>
                {recordType === "income" ? "+" : "-"}{formatCurrency(parseFloat(amount) || 0, selectedAccount?.currency || "USD")}
              </Text>
              <View className="flex-row items-center mt-3 bg-theme-surface px-3 py-1.5 rounded-full border border-theme-tint/10">
                <Text className="text-theme-text opacity-70">
                  {selectedDateTime.toLocaleDateString()} • {selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(100).springify().mass(0.6).damping(14)} className="bg-theme-surface rounded-xl overflow-hidden border border-theme-tint/5 p-2 mb-6">
              <View className="flex-row justify-between items-center px-4 py-4 border-b border-theme-background">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="wallet-outline" size={24} color={colors.icon} style={{ marginRight: 12 }} />
                  <Text className="text-theme-text text-lg opacity-80">{t("new_expense.account")}</Text>
                </View>
                <Text className="text-theme-text text-lg font-medium">{selectedAccount?.name}</Text>
              </View>

              <View className="flex-row justify-between items-center px-4 py-4 border-b border-theme-background">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="shape-outline" size={24} color={colors.icon} style={{ marginRight: 12 }} />
                  <Text className="text-theme-text text-lg opacity-80">{t("new_expense.category")}</Text>
                </View>
                <Text className="text-theme-text text-lg font-medium">{selectedCategory?.name}</Text>
              </View>

              <View className="flex-row justify-between items-center px-4 py-4">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name={(selectedPaymentMethod?.icon as any) || "credit-card-outline"} size={24} color={colors.icon} style={{ marginRight: 12 }} />
                  <Text className="text-theme-text text-lg opacity-80">{t("new_expense.payment_method")}</Text>
                </View>
                <Text className="text-theme-text text-lg font-medium">{selectedPaymentMethod?.name}</Text>
              </View>
            </Animated.View>

            {location && (
              <Animated.View entering={FadeInUp.delay(200).springify().mass(0.6).damping(14)} className="mb-6 rounded-xl overflow-hidden">
                <LocationSelection
                  location={location}
                  setLocation={setLocation}
                  setScrollEnabled={setScrollEnabled}
                  disabled={true}
                />
              </Animated.View>
            )}

            {images.length > 0 && (
              <Animated.View entering={FadeInUp.delay(300).springify().mass(0.6).damping(14)} className="mb-6">
                <ImageAttachmentSelection images={images} setImages={setImages} isEditing={false} />
              </Animated.View>
            )}

            <Animated.View entering={FadeInUp.delay(400).springify().mass(0.6).damping(14)} className="mt-4">
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="w-full bg-theme-tint py-4 rounded-xl flex-row justify-center items-center shadow-sm"
              >
                <MaterialCommunityIcons name="pencil" size={24} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-xl">{t("common.edit")}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          <View className="mb-10">
            {/* Edit Mode Form */}
            <View className="flex-row bg-theme-surface p-1.5 rounded-lg mb-6">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-md items-center justify-center ${recordType === "expense" ? "bg-theme-tint" : ""
                  }`}
                activeOpacity={0.8}
                onPress={() => isEditing && setRecordType("expense")}
                disabled={!isEditing}
              >
                <Text
                  className={`text-lg font-bold ${recordType === "expense" ? "text-theme-textLight" : "text-theme-text"
                    }`}
                  style={recordType !== "expense" ? { opacity: 0.6 } : {}}
                >
                  {t("new_expense.expense", "Expense")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-md items-center justify-center ${recordType === "income" ? "bg-theme-tint" : ""
                  }`}
                activeOpacity={0.8}
                onPress={() => isEditing && setRecordType("income")}
                disabled={!isEditing}
              >
                <Text
                  className={`text-lg font-bold ${recordType === "income" ? "text-theme-textLight" : "text-theme-text"
                    }`}
                  style={recordType !== "income" ? { opacity: 0.6 } : {}}
                >
                  {t("new_expense.income", "Income")}
                </Text>
              </TouchableOpacity>
            </View>

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
              typeFilter={recordType}
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

            {(isEditing || images.length > 0) && (
              <ImageAttachmentSelection images={images} setImages={setImages} isEditing={isEditing} />
            )}

            <View className="mt-8">
              <TouchableOpacity
                onPress={handleSave}
                className="w-full bg-theme-tint py-4 rounded-xl flex-row justify-center items-center shadow-sm"
              >
                <Text className="text-white font-bold text-xl">{t("common.save")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                className="w-full bg-theme-surface mt-4 py-4 rounded-xl flex-row justify-center items-center border border-theme-tint/10"
              >
                <Text className="text-theme-text font-bold text-lg opacity-80">{t("common.cancel", "Cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
