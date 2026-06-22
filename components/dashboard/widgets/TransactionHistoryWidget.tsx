import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View, useColorScheme, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { formatCurrency } from "@/utils/formatCurrency";
import { Colors } from "@/constants/theme";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import {
  useExpenseRecords,
  TransactionRecord,
} from "@/hooks/use-expense-records";
import { getCategoryIcon } from "@/types/data/category";
import { useTranslation } from "react-i18next";

interface TransactionHistoryWidgetProps {
  records?: TransactionRecord[];
  onSeeAllPress: () => void;
  accountId?: string;
}

export const TransactionHistoryRow = ({
  record,
}: {
  record: TransactionRecord;
}) => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  const router = useRouter();

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-1"
      onPress={() => router.push(`/record-details/${record.id}`)}
    >
      <View className="flex-1 flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-theme-tint">
          <MaterialCommunityIcons
            name={
              (record.categoryIcon as any) ||
              getCategoryIcon(record.categoryName)
            }
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
    </TouchableOpacity>
  );
};

export const TransactionHistoryWidget: React.FC<
  TransactionHistoryWidgetProps
> = ({ records: propRecords, onSeeAllPress, accountId }) => {
  const {
    records: localRecords,
    loading,
    error,
  } = useExpenseRecords(accountId);
  const { t } = useTranslation();

  const toShow =
    propRecords && propRecords.length > 0
      ? propRecords
      : (localRecords ?? []).slice(0, 3);

  if (!loading && !error && toShow.length === 0) return null;

  return (
    <DashboardWidgetCard
      title={t("dashboard.transaction_history")}
      actionLabel={t("common.see_all")}
      onActionPress={onSeeAllPress}
    >
      <View>
        {loading ? (
          <Text className="text-theme-text">{t("common.loading")}</Text>
        ) : null}
        {error ? <Text className="text-theme-text">{error}</Text> : null}
        {toShow.map((record, index) => (
          <View key={record.id}>
            <TransactionHistoryRow record={record} />
            {index < toShow.length - 1 ? (
              <View className="h-px bg-black/5" />
            ) : null}
          </View>
        ))}
      </View>
    </DashboardWidgetCard>
  );
};
