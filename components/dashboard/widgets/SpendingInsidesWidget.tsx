import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { useSQLiteContext } from "expo-sqlite";
import { getAllCategories } from "@/data/categories";
import { formatCurrency } from "@/utils/formatCurrency";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getCategoryIcon } from "@/types/data/category";

import { PolarChart, Pie } from "victory-native";
import { CATEGORY_COLORS } from "@/constants/categoryColors";

export const SpendingInsidesWidget: React.FC<{ onShowMore?: () => void; accountId?: string }> = ({
  onShowMore, accountId
}) => {
  const scheme = useColorScheme() ?? "light";
  const [recordsRaw, setRecordsRaw] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const db = useSQLiteContext();
  const [accounts, setAccounts] = React.useState<Record<string, string>>({});
  const [categories, setCategories] = React.useState<Record<string, string>>(
    {},
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!db) return;
      try {
        const cats = await getAllCategories(db);
        if (mounted) {
          const map: Record<string, string> = {};
          cats.forEach((c) => (map[c.id] = c.name));
          setCategories(map);
        }

        const { getAllAccounts } = await import("@/data/accounts");
        const accts = await getAllAccounts(db);
        if (mounted) {
          const accMap: Record<string, string> = {};
          accts.forEach((a) => (accMap[a.id] = a.currency));
          setAccounts(accMap);
        }

        setLoading(true);
        const local = await getAllExpenseRecords(db);
        let filteredLocal = local;
        if (accountId) {
            filteredLocal = local.filter((r) => r.accountId === accountId);
        }
        if (mounted) {
          setRecordsRaw(filteredLocal);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [db, accountId]);

  const totalsByCategory = React.useMemo(() => {
    const map = new Map<string, { amount: number; currency: string }[]>();
    recordsRaw.forEach((r) => {
      if (r.amount === undefined || r.amount === null) return;
      if (r.amount >= 0) return;
      const cat = r.categoryId ?? "uncategorized";
      const currency = accounts[r.accountId] ?? "PLN";
      const entry = map.get(cat) ?? [];
      entry.push({ amount: Math.abs(r.amount), currency });
      map.set(cat, entry);
    });
    return map;
  }, [recordsRaw, accounts]);

  const data = React.useMemo((): {
    label: string;
    value: number;
    color: string;
    categoryId?: string;
    currency: string;
    displayAmount: string;
  }[] => {
    const arr: {
      label: string;
      value: number;
      color: string;
      categoryId?: string;
      currency: string;
      displayAmount: string;
    }[] = [];
    const entries = Array.from(totalsByCategory.entries());
    entries.sort((a, b) => {
      const aTotal = a[1].reduce((s, e) => s + e.amount, 0);
      const bTotal = b[1].reduce((s, e) => s + e.amount, 0);
      return bTotal - aTotal;
    });
    entries.forEach(([catId, entries], idx) => {
      const label = categories[catId] ?? "Other";
      const primaryCurrency = entries[0].currency;
      const amounts: Record<string, number> = {};
      let chartValue = 0;
      entries.forEach(({ amount, currency }) => {
        amounts[currency] = (amounts[currency] ?? 0) + amount;
        if (currency === primaryCurrency) chartValue += amount;
        else if (!primaryCurrency) chartValue += amount;
      });
      const displayParts = Object.entries(amounts)
        .sort(([, a], [, b]) => b - a)
        .map(([curr, amt]) => formatCurrency(amt, curr));
      const displayAmount = displayParts.join(" | ");
      arr.push({
        label,
        value: chartValue,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        categoryId: catId,
        currency: primaryCurrency,
        displayAmount,
      });
    });
    return arr;
  }, [totalsByCategory, categories]);

  const totalsByCurrency = React.useMemo(() => {
    const map = new Map<string, number>();
    recordsRaw.forEach((r) => {
      if (r.amount === undefined || r.amount === null) return;
      if (r.amount >= 0) return;
      const currency = accounts[r.accountId] ?? "PLN";
      const prev = map.get(currency) ?? 0;
      map.set(currency, prev + Math.abs(r.amount));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([curr, amt]) => formatCurrency(amt, curr))
      .join(" | ");
  }, [recordsRaw, accounts]);

  return (
    <DashboardWidgetCard
      title="Spending Insights"
      actionLabel={onShowMore ? "See all" : undefined}
      onActionPress={onShowMore}
    >
      <View className="flex-row items-center">
        <View style={{ width: 120, height: 120 }}>
          {data.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-theme-text text-xs">No expenses</Text>
            </View>
          ) : (
            <PolarChart<
              { label: string; value: number; color: string },
              "label",
              "value",
              "color"
            >
              data={data}
              labelKey={"label"}
              valueKey={"value"}
              colorKey={"color"}
            >
              <Pie.Chart innerRadius="70%" />
            </PolarChart>
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-theme-text text-[14px] font-semibold">
            Total:
          </Text>
          <Text className="text-theme-text text-[16px] font-bold" numberOfLines={1}>
            {totalsByCurrency || "0"}
          </Text>

          <View className="mt-2">
            {data.slice(0, 3).map((d) => (
              <View
                key={d.label}
                className="flex-row items-center py-0.5"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <MaterialCommunityIcons
                    name={getCategoryIcon(d.label)}
                    size={14}
                    color={d.color}
                  />
                  <Text className="ml-1.5 text-theme-text text-sm flex-1" numberOfLines={1}>
                    {d.label}
                  </Text>
                </View>

                <Text className="text-theme-text text-sm font-medium">{d.displayAmount}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {loading ? (
        <Text className="text-theme-text mt-2">Loading...</Text>
      ) : null}
      {error ? <Text className="text-theme-text mt-2">{error}</Text> : null}
    </DashboardWidgetCard>
  );
};

export default SpendingInsidesWidget;
