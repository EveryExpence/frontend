import React from "react";
import { ScrollView, Text, View, useColorScheme, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useExpenseRecords, TransactionRecord, TransactionSection } from "@/hooks/use-expense-records";
import { getCategoryIcon } from "@/types/data/category";

function TransactionRow({ item }: { item: TransactionRecord }) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/record-details/${item.id}`)}
      className="flex-row items-center justify-between py-1.5 active:opacity-70"
    >
      <View className="flex-row items-center gap-3 flex-1 pr-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-theme-tint">
          <MaterialCommunityIcons
            name={getCategoryIcon(item.categoryName)}
            size={20}
            color={colors.textLight}
          />
        </View>

        <View className="flex-1">
          <Text className="text-[18px] text-theme-text" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-[13px] text-theme-text opacity-60" numberOfLines={1}>
            {item.categoryName} • {item.paymentMethodName}
          </Text>
        </View>
      </View>

      <Text
        className={`text-[18px] ${item.kind === "income" ? "text-theme-success" : "text-theme-text"}`}
      >
        {item.kind === "income"
          ? `+${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.currency}`
          : `${item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${item.currency}`}
      </Text>
    </Pressable>
  );
}

function TransactionSectionCard({ section }: { section: TransactionSection }) {
  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between px-1">
        <Text className="text-[22px] font-medium text-theme-text">{section.title}</Text>
        <Text className="text-[20px] text-theme-text">{section.summary}</Text>
      </View>

      <Card>
        <CardContent className="px-4 py-3">
          {section.items.map((item: TransactionRecord, index: number) => (
            <View key={item.id}>
              <TransactionRow item={item} />
              {index < section.items.length - 1 ? <Separator className="my-1" /> : null}
            </View>
          ))}
        </CardContent>
      </Card>
    </View>
  );
}

export default function RecordsScreen() {
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();
  const { sections, loading, error } = useExpenseRecords(accountId);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return sections;

    const query = searchQuery.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const titleMatch = item.title.toLowerCase().includes(query);
          const categoryMatch = item.categoryName.toLowerCase().includes(query);
          const amountMatch = Math.abs(item.amount).toString().includes(query);
          return titleMatch || categoryMatch || amountMatch;
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 28 }}
      >
        <Text className="text-[36px] font-semibold leading-tight text-theme-text">
          Transaction History
        </Text>

        <View className="mt-5">
          <View className="relative">
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              className="absolute left-3 top-3 z-10 text-theme-icon"
            />
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, category or amount"
              editable={true}
              className="pl-11"
            />
          </View>
        </View>

        <View className="mt-8 gap-6">
          {loading && <Text className="text-theme-text text-center">Loading...</Text>}
          {error && <Text className="text-theme-error text-center">{error}</Text>}
          {!loading && filteredSections.length === 0 && (
            <Text className="text-theme-text text-center opacity-60">
              {searchQuery ? "No transactions found" : "No transactions yet"}
            </Text>
          )}
          {filteredSections.map((section: TransactionSection) => (
            <TransactionSectionCard key={section.id} section={section} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
