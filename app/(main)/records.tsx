import React from "react";
import { ScrollView, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  mockTransactionSections,
  TransactionRecord,
  TransactionSection,
} from "@/components/dashboard/widgets/mockTransactions";

function TransactionRow({ item }: { item: TransactionRecord }) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const amountColor = item.kind === "income" ? colors.success : colors.text;

  return (
    <View className="flex-row items-center justify-between py-1.5">
      <View className="flex-row items-center gap-3 flex-1 pr-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.tint }}
        >
          <MaterialCommunityIcons name="swap-vertical" size={20} color={colors.textLight} />
        </View>

        <Text className="flex-1 text-[18px] text-theme-text" numberOfLines={1}>
          {item.title}
        </Text>
      </View>

      <Text className="text-[18px]" style={{ color: amountColor }}>
        {item.kind === "income"
          ? `+${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.currency}`
          : `${item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${item.currency}`}
      </Text>
    </View>
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
          {section.items.map((item, index) => (
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
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

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
              color={colors.icon}
              style={{ position: "absolute", left: 14, top: 12, zIndex: 1 }}
            />
            <Input
              value=""
              placeholder="Search"
              editable={false}
              className="pl-11"
            />
          </View>
        </View>

        <View className="mt-8 gap-6">
            {mockTransactionSections.map((section: TransactionSection) => (
            <TransactionSectionCard key={section.id} section={section} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
