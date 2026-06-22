import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { useSQLiteContext } from "expo-sqlite";
import { getAllCategories } from "@/data/categories";
import { formatCurrency } from "@/utils/formatCurrency";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getCategoryIcon } from "@/types/data/category";
import { useTranslation } from "react-i18next";

import { PolarChart, Pie } from "victory-native";
import { CATEGORY_COLORS } from "@/constants/categoryColors";
import { fetchExchangeRates, convertAmountToUSD } from "@/utils/exchangeRates";
import { useAuth } from "@/context/authContext";

export const IncomeInsightsWidget: React.FC<{ onShowMore?: () => void; accountId?: string }> = ({
  onShowMore, accountId
}) => {
  const scheme = useColorScheme() ?? "light";
  const { t } = useTranslation();
  const [recordsRaw, setRecordsRaw] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const db = useSQLiteContext();
  const [accounts, setAccounts] = React.useState<Record<string, string>>({});
  const [categories, setCategories] = React.useState<Record<string, string>>(
    {},
  );
  const [rates, setRates] = React.useState<Record<string, number>>({});
  const { user } = useAuth();
  const convertToUSD = !!user;

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

        if (convertToUSD) {
          const fetchedRates = await fetchExchangeRates("USD");
          if (mounted) setRates(fetchedRates);
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
    const map = new Map<string, { amount: number; currency: string; categoryId: string }[]>();
    recordsRaw.forEach((r) => {
      if (r.amount === undefined || r.amount === null) return;
      if (r.amount <= 0) return;
      const cat = r.categoryId ?? "uncategorized";
      const originalCurrency = accounts[r.accountId] ?? "PLN";

      let amt = r.amount;
      let currency = originalCurrency;
      let key = `${cat}_${currency}`;

      if (convertToUSD) {
        amt = convertAmountToUSD(amt, originalCurrency, rates);
        currency = "USD";
        key = cat;
      }

      const entry = map.get(key) ?? [];
      entry.push({ amount: amt, currency, categoryId: cat });
      map.set(key, entry);
    });
    return map;
  }, [recordsRaw, accounts, convertToUSD, rates]);

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
    const grandTotal = entries.reduce((acc, [, entry]) => acc + entry.reduce((s, e) => s + e.amount, 0), 0);

    entries.forEach(([key, entries], idx) => {
      const catId = entries[0].categoryId;
      const label = categories[catId] ?? "Other";
      const primaryCurrency = entries[0].currency;
      let chartValue = 0;
      entries.forEach(({ amount }) => {
        chartValue += amount;
      });

      const percentage = grandTotal > 0 ? ((chartValue / grandTotal) * 100).toFixed(1) : "0.0";
      const displayAmount = `${percentage}%`;
      arr.push({
        label: `${label} (${primaryCurrency})`,
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
      if (r.amount <= 0) return;
      const originalCurrency = accounts[r.accountId] ?? "PLN";

      let amt = r.amount;
      let currency = originalCurrency;

      if (convertToUSD) {
        amt = convertAmountToUSD(amt, originalCurrency, rates);
        currency = "USD";
      }

      const prev = map.get(currency) ?? 0;
      map.set(currency, prev + amt);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([curr, amt]) => formatCurrency(amt, curr))
      .join(" | ");
  }, [recordsRaw, accounts, convertToUSD, rates]);

  if (!loading && !error && data.length === 0) return null;

  return (
    <DashboardWidgetCard
      title={t("dashboard.income_insights", "Income Insights")}
      actionLabel={onShowMore ? t("common.see_all") : undefined}
      onActionPress={onShowMore}
    >
      <View className="flex-row items-center">
        <View style={{ width: 120, height: 120 }}>
          {data.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-theme-text text-xs text-center">{t("dashboard.no_income", "No income")}</Text>
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
            {t("common.total")}:
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
        <Text className="text-theme-text mt-2">{t("common.loading")}</Text>
      ) : null}
      {error ? <Text className="text-theme-text mt-2">{error}</Text> : null}
    </DashboardWidgetCard>
  );
};

export default IncomeInsightsWidget;
