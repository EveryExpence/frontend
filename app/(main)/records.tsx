import React from "react";
import {
  ScrollView,
  Text,
  View,
  useColorScheme,
  Pressable,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useExpenseRecords,
  TransactionRecord,
  TransactionSection,
} from "@/hooks/use-expense-records";
import { getCategoryIcon } from "@/types/data/category";
import { useTranslation } from "react-i18next";
import { useSQLiteContext } from "expo-sqlite";
import { formatCurrency } from "@/utils/formatCurrency";
import { deleteExpenseRecord } from "@/data/expenseRecords";
import Toast from "react-native-toast-message";
import { useSync } from "@/context/syncContext";
import DeleteRecordModal from "@/components/records/DeleteRecordModal";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import CustomModal from "@/components/Modal";

import { Swipeable } from "react-native-gesture-handler";

function TransactionRow({
  item,
  onDelete,
}: {
  item: TransactionRecord;
  onDelete: (item: TransactionRecord) => void;
}) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const router = useRouter();
  const swipeableRef = React.useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete(item);
  };

  const renderLeftActions = () => {
    return (
      <TouchableOpacity
        onPress={handleDelete}
        className="justify-center items-center px-6 bg-red-500"
      >
        <MaterialCommunityIcons name="delete-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View entering={FadeInDown.springify().mass(0.5).damping(12)}>
      <Swipeable ref={swipeableRef} renderLeftActions={renderLeftActions}>
        <Pressable
          onPress={() => router.push(`/record-details/${item.id}`)}
          className="flex-row items-center justify-between py-1.5 bg-theme-surface active:opacity-70"
        >
          <View className="flex-row items-center gap-3 flex-1 pr-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-theme-tint">
              <MaterialCommunityIcons
                name={
                  (item.categoryIcon as any) || getCategoryIcon(item.categoryName)
                }
                size={20}
                color={colors.textLight}
              />
            </View>

            <View className="flex-1">
              <Text className="text-[18px] text-theme-text" numberOfLines={1}>
                {item.title}
              </Text>
              <Text
                className="text-[13px] text-theme-text opacity-60 mt-0.5"
                numberOfLines={1}
              >
                {(item as any).createdAtTime ? new Date((item as any).createdAtTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' : ''}{item.title === item.categoryName ? item.paymentMethodName : `${item.categoryName} • ${item.paymentMethodName}`}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text
              className={`text-[18px] ${item.kind === "income" ? "text-theme-success" : "text-theme-text"}`}
            >
              {item.kind === "income" ? "+" : "-"}{formatCurrency(item.amount, item.currency)}
            </Text>
            {item.changeRate !== undefined && (
              <Text
                className={`text-[13px] ${item.changeRate >= 0 ? "text-[#208c05]" : "text-red-600"}`}
              >
                {item.changeRate >= 0 ? "+" : "-"}{Math.abs(item.changeRate).toFixed(1)}%
              </Text>
            )}
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

function TransactionSectionCard({
  section,
  index,
  onDelete,
}: {
  section: TransactionSection;
  index: number;
  onDelete: (item: TransactionRecord) => void;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 100).springify().mass(0.6).damping(14)} className="gap-3">
      <View className="flex-row items-end justify-between px-1">
        <Text className="text-[22px] font-medium text-theme-text">
          {section.title}
        </Text>
        <Text className="text-[16px] text-theme-text opacity-60">
          {section.summary}
        </Text>
      </View>

      <Card>
        <CardContent className="px-4 py-3">
          {section.items.map((item: TransactionRecord, index: number) => (
            <View key={item.id}>
              <TransactionRow item={item} onDelete={onDelete} />
              {index < section.items.length - 1 ? (
                <Separator className="my-1" />
              ) : null}
            </View>
          ))}
        </CardContent>
      </Card>
    </Animated.View>
  );
}

export default function RecordsScreen() {
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? "light";
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();
  const db = useSQLiteContext();
  const { triggerSync } = useSync();
  const { records, sections, loading, error, refetch } = useExpenseRecords(accountId, accountId ? 'account' : 'total');
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"date" | "amount_desc" | "amount_asc">("date");
  const [filterCategory, setFilterCategory] = React.useState<string | null>(null);
  const [filterAccount, setFilterAccount] = React.useState<string | null>(null);
  const [filterPayment, setFilterPayment] = React.useState<string | null>(null);

  const availableCategories = React.useMemo(() => Array.from(new Set(records.map(r => r.categoryName))), [records]);
  const availableAccounts = React.useMemo(() => Array.from(new Set(records.map(r => (r as any).accountName))), [records]);
  const availablePayments = React.useMemo(() => Array.from(new Set(records.map(r => r.paymentMethodName))), [records]);

  const [isFilterModalVisible, setIsFilterModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [recordToDelete, setRecordToDelete] =
    React.useState<TransactionRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeletePress = (item: TransactionRecord) => {
    setRecordToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await deleteExpenseRecord(db, recordToDelete.id);
      Toast.show({ text1: t("records.delete_success"), type: "success" });
      refetch();
      triggerSync();
    } catch (e) {
      Toast.show({ text1: t("records.delete_failed"), type: "error" });
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      setRecordToDelete(null);
    }
  };

  const filteredSections = React.useMemo(() => {
    let result = sections;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            const queryMatch = searchQuery.trim() === "" || (
              item.title.toLowerCase().includes(query) ||
              item.categoryName.toLowerCase().includes(query) ||
              Math.abs(item.amount).toString().includes(query) ||
              ((item as any).accountName || '').toLowerCase().includes(query) ||
              item.paymentMethodName.toLowerCase().includes(query)
            );
            const catMatch = !filterCategory || item.categoryName === filterCategory;
            const accMatch = !filterAccount || (item as any).accountName === filterAccount;
            const payMatch = !filterPayment || item.paymentMethodName === filterPayment;

            return queryMatch && catMatch && accMatch && payMatch;
          }),
        }))
        .filter((section) => section.items.length > 0);
    }

    if (sortBy === "amount_desc") {
      result = result.map(s => ({ ...s, items: [...s.items].sort((a, b) => b.amount - a.amount) }));
    } else if (sortBy === "amount_asc") {
      result = result.map(s => ({ ...s, items: [...s.items].sort((a, b) => a.amount - b.amount) }));
    }
    
    return result;
  }, [sections, searchQuery, sortBy, filterCategory, filterAccount, filterPayment]);

  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 28,
        }}
      >
        <Text className="text-[36px] font-semibold leading-tight text-theme-text">
          {t("records.title")}
        </Text>

        <View className="mt-5">
          <View className="flex-row items-center gap-2">
            <View className="relative flex-1">
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                className="absolute left-3 top-3 z-10 text-theme-icon"
              />
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t("records.search_placeholder")}
                editable={true}
                className="pl-11"
              />
            </View>
            <TouchableOpacity
              onPress={() => setIsFilterModalVisible(true)}
              className={`p-3 rounded-md ${filterCategory || filterAccount || filterPayment ? "bg-theme-tint" : "bg-theme-surface"}`}
            >
              <MaterialCommunityIcons name="filter-variant" size={24} color={filterCategory || filterAccount || filterPayment ? Colors[scheme].textLight : Colors[scheme].icon} />
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-2 mt-3 items-center">
            <MaterialCommunityIcons name="sort" size={20} className="text-theme-text opacity-60" />
            <TouchableOpacity onPress={() => setSortBy('date')} className={`px-4 py-1.5 rounded-full ${sortBy === 'date' ? 'bg-theme-tint' : 'bg-theme-surface'}`}>
              <Text className={`${sortBy === 'date' ? 'text-white' : 'text-theme-text'}`}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortBy('amount_desc')} className={`px-4 py-1.5 rounded-full ${sortBy === 'amount_desc' ? 'bg-theme-tint' : 'bg-theme-surface'}`}>
              <Text className={`${sortBy === 'amount_desc' ? 'text-white' : 'text-theme-text'}`}>Highest</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortBy('amount_asc')} className={`px-4 py-1.5 rounded-full ${sortBy === 'amount_asc' ? 'bg-theme-tint' : 'bg-theme-surface'}`}>
              <Text className={`${sortBy === 'amount_asc' ? 'text-white' : 'text-theme-text'}`}>Lowest</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8 gap-6">
          {loading && (
            <Text className="text-theme-text text-center">
              {t("common.loading")}
            </Text>
          )}
          {error && (
            <Text className="text-theme-error text-center">{error}</Text>
          )}
          {!loading && filteredSections.length === 0 && (
            <Text className="text-theme-text text-center opacity-60">
              {searchQuery
                ? t("records.no_results")
                : t("records.no_transactions")}
            </Text>
          )}
          {filteredSections.map((section: TransactionSection, i: number) => (
            <TransactionSectionCard
              key={section.id}
              section={section}
              index={i}
              onDelete={handleDeletePress}
            />
          ))}
        </View>
      </ScrollView>

      <DeleteRecordModal
        visible={deleteModalVisible}
        title={recordToDelete?.title}
        isDeleting={isDeleting}
        onClose={() => {
          setDeleteModalVisible(false);
          setRecordToDelete(null);
        }}
        onConfirm={confirmDelete}
      />

      <CustomModal
        isVisible={isFilterModalVisible}
        setIsVisible={setIsFilterModalVisible}
        title="Filter Transactions"
        showCloseIcon={true}
      >
        <ScrollView className="max-h-[60vh] w-full mt-2" showsVerticalScrollIndicator={false}>
          {availableAccounts.length > 1 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-theme-text mb-3">Accounts</Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity onPress={() => setFilterAccount(null)} className={`px-4 py-2 rounded-full border border-theme-tint/20 ${!filterAccount ? 'bg-theme-tint' : 'bg-transparent'}`}>
                  <Text className={!filterAccount ? 'text-white font-bold' : 'text-theme-text opacity-80'}>All Accounts</Text>
                </TouchableOpacity>
                {availableAccounts.map(a => (
                  <TouchableOpacity key={a} onPress={() => setFilterAccount(a)} className={`px-4 py-2 rounded-full border border-theme-tint/20 ${filterAccount === a ? 'bg-theme-tint' : 'bg-transparent'}`}>
                    <Text className={filterAccount === a ? 'text-white font-bold' : 'text-theme-text opacity-80'}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className="mb-6">
            <Text className="text-lg font-bold text-theme-text mb-3">Categories</Text>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity onPress={() => setFilterCategory(null)} className={`px-4 py-2 rounded-full border border-theme-tint/20 ${!filterCategory ? 'bg-theme-tint' : 'bg-transparent'}`}>
                <Text className={!filterCategory ? 'text-white font-bold' : 'text-theme-text opacity-80'}>All Categories</Text>
              </TouchableOpacity>
              {availableCategories.map(c => (
                <TouchableOpacity key={c} onPress={() => setFilterCategory(c)} className={`px-4 py-2 rounded-full border border-theme-tint/20 ${filterCategory === c ? 'bg-theme-tint' : 'bg-transparent'}`}>
                  <Text className={filterCategory === c ? 'text-white font-bold' : 'text-theme-text opacity-80'}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-theme-text mb-3">Payment Methods</Text>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity onPress={() => setFilterPayment(null)} className={`px-4 py-2 rounded-full border border-theme-tint/20 ${!filterPayment ? 'bg-theme-tint' : 'bg-transparent'}`}>
                <Text className={!filterPayment ? 'text-white font-bold' : 'text-theme-text opacity-80'}>All Methods</Text>
              </TouchableOpacity>
              {availablePayments.map(p => (
                <TouchableOpacity key={p} onPress={() => setFilterPayment(p)} className={`px-4 py-2 rounded-full border border-theme-tint/20 ${filterPayment === p ? 'bg-theme-tint' : 'bg-transparent'}`}>
                  <Text className={filterPayment === p ? 'text-white font-bold' : 'text-theme-text opacity-80'}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </CustomModal>
    </SafeAreaView>
  );
}
