import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View, useColorScheme } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";
import { Colors } from "@/constants/theme";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { TransactionRecord } from "./mockTransactions";
import { useExpenseRecords } from "@/hooks/use-expense-records";

interface TransactionHistoryWidgetProps {
  records?: TransactionRecord[];
  onSeeAllPress: () => void;
}

export const TransactionHistoryRow = ({
  record,
}: {
  record: TransactionRecord;
}) => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  return (
    <View className="flex-row items-center justify-between py-1">
      <View className="flex-1 flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-theme-tint">
          <MaterialCommunityIcons
            name="swap-vertical"
            size={20}
            color={colors.textLight}
          />
        </View>

        <View className="ml-3 flex-1">
          <Text
            className="text-[18px] font-medium text-theme-text"
            numberOfLines={1}
          >
            {record.title}
          </Text>
        </View>
      </View>

      <Text
        className={`text-[18px] font-medium ${record.kind === "income" ? "text-theme-success" : "text-theme-text"}`}
      >
        {formatCurrency(record.amount, record.currency)}
      </Text>
    </View>
  );
};

export const TransactionHistoryWidget: React.FC<TransactionHistoryWidgetProps> = ({ records: propRecords, onSeeAllPress }) => {
  const { records: localRecords, loading, error } = useExpenseRecords();

  const toShow = propRecords && propRecords.length > 0 ? propRecords : (localRecords ?? []).slice(0, 3);

  return (
    <DashboardWidgetCard title="Transaction History" actionLabel="See all" onActionPress={onSeeAllPress}>
      <View>
        {loading ? <Text className="text-theme-text">Loading...</Text> : null}
        {error ? <Text className="text-theme-text">{error}</Text> : null}
        {toShow.map((record, index) => (
          <View key={record.id}>
            <TransactionHistoryRow record={record} />
            {index < toShow.length - 1 ? <View className="h-px bg-black/5" /> : null}
          </View>
        ))}
      </View>
    </DashboardWidgetCard>
  );
};
