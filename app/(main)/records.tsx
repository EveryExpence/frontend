import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Topbar from "@/components/Topbar";
import { mockTransactionRecords } from "@/components/dashboard/widgets/mockTransactions";
import { TransactionHistoryRow } from "@/components/dashboard/widgets/TransactionHistoryWidget";

export default function RecordsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-theme-background mt-6">
      <FlatList
        data={mockTransactionRecords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          gap: 12,
        }}
        renderItem={({ item }) => (
          <View className="rounded-2xl bg-theme-surface px-4 py-4">
            <TransactionHistoryRow record={item} />
          </View>
        )}
        ListHeaderComponent={
          <View className="px-4 pb-2">
            <Text className="mt-2 text-3xl font-semibold text-theme-text">
              Transaction History
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
