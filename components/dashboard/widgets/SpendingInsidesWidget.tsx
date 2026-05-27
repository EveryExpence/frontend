import React from "react";
import { View, Text, useColorScheme, Pressable } from "react-native";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { useSQLiteContext } from "expo-sqlite";
import { getAllCategories } from "@/data/categories";
import { formatCurrency } from "@/utils/formatCurrency";

import { PolarChart, Pie } from "victory-native";

const DEFAULT_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#2DD4BF",
  "#F472B6",
];

export const SpendingInsidesWidget: React.FC<{ onShowMore?: () => void }> = ({
  onShowMore,
}) => {
  const scheme = useColorScheme() ?? "light";
  const [recordsRaw, setRecordsRaw] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const db = useSQLiteContext();
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

        setLoading(true);
        const local = await getAllExpenseRecords(db);
        if (mounted) {
          setRecordsRaw(local);
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
  }, [db]);

  const totalsByCategory = React.useMemo(() => {
    const map = new Map<string, number>();
    recordsRaw.forEach((r) => {
      if (r.amount === undefined || r.amount === null) return;
      if (r.amount >= 0) return; // skip incomes
      const cat = r.categoryId ?? "uncategorized";
      const prev = map.get(cat) ?? 0;
      map.set(cat, prev + Math.abs(r.amount));
    });
    return map;
  }, [recordsRaw]);

  const data = React.useMemo((): {
    label: string;
    value: number;
    color: string;
    categoryId?: string;
  }[] => {
    const arr: {
      label: string;
      value: number;
      color: string;
      categoryId?: string;
    }[] = [];
    const entries = Array.from(totalsByCategory.entries());
    entries.sort((a, b) => b[1] - a[1]);
    entries.forEach(([catId, value], idx) => {
      const label = categories[catId] ?? "Other";
      arr.push({
        label,
        value,
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        categoryId: catId,
      });
    });
    return arr;
  }, [totalsByCategory, categories]);

  const totalValue = React.useMemo(
    () => data.reduce((s, d) => s + d.value, 0),
    [data],
  );

  return (
    <DashboardWidgetCard
      title="Spending Insights"
      actionLabel={onShowMore ? "Show More" : undefined}
      onActionPress={onShowMore}
    >
      <View className="flex-row items-center justify-between">
        <View style={{ width: 160, height: 160 }}>
          {data.length === 0 ? (
            <View className="items-center justify-center">
              <Text className="text-theme-text">No expenses yet</Text>
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
              <Pie.Chart />
            </PolarChart>
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-theme-text text-[16px] font-semibold">
            Total:
          </Text>
          <Text className="text-theme-text text-[18px] font-bold">
            {formatCurrency(totalValue, "PLN")}
          </Text>

          <View className="mt-3">
            {data.map((d) => (
              <View
                key={d.label}
                className="flex-row items-center justify-between py-1"
              >
                <View className="flex-row items-center">
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: d.color,
                    }}
                  />
                  <Text className="ml-2 text-theme-text">{d.label}</Text>
                </View>

                <Text className="text-theme-text">
                  {formatCurrency(d.value, "PLN")}
                </Text>
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
