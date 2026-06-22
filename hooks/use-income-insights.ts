import React from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { getAllCategories } from "@/data/categories";
import { getAllAccounts } from "@/data/accounts";
import { ExpenseRecord } from "@/types/data/expenseRecord";
import { Category } from "@/types/data/category";
import { formatCurrency } from "@/utils/formatCurrency";
import { CATEGORY_COLORS } from "@/constants/categoryColors";
import { fetchExchangeRates, convertAmountToUSD } from "@/utils/exchangeRates";
import { useAuth } from "@/context/authContext";

export interface CategoryIncomeItem {
    id: string;
    description: string;
    amount: number;
    currency: string;
    createdAt?: number;
}

export interface CategoryGroup {
    categoryId: string;
    categoryName: string;
    categoryIcon?: string;
    totalAmount: number;
    displayAmount: string;
    color: string;
    currency: string;
    items: CategoryIncomeItem[];
}

export function useIncomeInsights(startDate: Date, endDate: Date, accountId?: string) {
    const db = useSQLiteContext();
    const [categoryGroups, setCategoryGroups] = React.useState<CategoryGroup[]>(
        [],
    );
    const [totalDisplayLines, setTotalDisplayLines] = React.useState<string[]>(
        [],
    );
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { user } = useAuth();
    const convertToUSD = !!user;

    const fetch = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);
            setError(null);

            const [allRecords, allCategories, allAccounts] = await Promise.all([
                getAllExpenseRecords(db),
                getAllCategories(db),
                getAllAccounts(db),
            ]);

            const categoryMap: Record<string, Category> = {};
            allCategories.forEach((c) => (categoryMap[c.id] = c));

            const accountCurrencyMap: Record<string, string> = {};
            allAccounts.forEach((a) => (accountCurrencyMap[a.id] = a.currency));

            let rates: Record<string, number> = {};
            if (convertToUSD) {
                rates = await fetchExchangeRates("USD");
            }

            const startTs = startDate.getTime();
            const endTs = endDate.getTime();

            const filtered = allRecords.filter((r) => {
                if (accountId && r.accountId !== accountId) return false;
                if (r.amount <= 0) return false; // Only income
                if (!r.createdAt) return false;
                const ts =
                    typeof r.createdAt === "number"
                        ? r.createdAt
                        : new Date(r.createdAt).getTime();
                return ts >= startTs && ts <= endTs;
            });

            const groupMap = new Map<
                string,
                { records: ExpenseRecord[]; totalAbs: number; currency: string; categoryId: string }
            >();

            filtered.forEach((r) => {
                const catId = r.categoryId ?? "uncategorized";
                const originalCurrency = accountCurrencyMap[r.accountId] ?? "PLN";

                let amt = Math.abs(r.amount);
                let currency = originalCurrency;
                let key = `${catId}_${currency}`;

                if (convertToUSD) {
                    amt = convertAmountToUSD(amt, originalCurrency, rates);
                    currency = "USD";
                    key = catId;
                }

                const existing: { records: ExpenseRecord[]; totalAbs: number; currency: string; categoryId: string } = groupMap.get(key) ?? {
                    records: [],
                    totalAbs: 0,
                    currency,
                    categoryId: catId,
                };
                existing.records.push(r);
                existing.totalAbs += amt;
                groupMap.set(key, existing);
            });

            const sortedEntries = Array.from(groupMap.entries()).sort(
                (a, b) => b[1].totalAbs - a[1].totalAbs,
            );

            const currencyTotals = new Map<string, number>();
            const groups: CategoryGroup[] = sortedEntries.map(
                ([key, data], idx) => {
                    const catName = categoryMap[data.categoryId]?.name ?? "Other";
                    const prev = currencyTotals.get(data.currency) ?? 0;
                    currencyTotals.set(data.currency, prev + data.totalAbs);

                    const items: CategoryIncomeItem[] = data.records
                        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                        .map((r) => {
                            const originalCurrency = accountCurrencyMap[r.accountId] ?? "PLN";
                            let amt = Math.abs(r.amount);
                            let currency = originalCurrency;

                            if (convertToUSD) {
                                amt = convertAmountToUSD(amt, originalCurrency, rates);
                                currency = "USD";
                            }

                            return {
                                id: r.id,
                                description: r.description || "Payment",
                                amount: amt,
                                currency,
                                createdAt: r.createdAt,
                            };
                        });

                    return {
                        categoryId: key,
                        categoryName: convertToUSD ? catName : `${catName} (${data.currency})`,
                        categoryIcon: categoryMap[data.categoryId]?.icon,
                        totalAmount: data.totalAbs,
                        displayAmount: formatCurrency(data.totalAbs, data.currency),
                        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                        currency: data.currency,
                        items,
                    };
                },
            );

            const lines = Array.from(currencyTotals.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([curr, amt]) => formatCurrency(amt, curr));

            setCategoryGroups(groups);
            setTotalDisplayLines(lines);
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [db, startDate.getTime(), endDate.getTime(), accountId, convertToUSD]);

    React.useEffect(() => {
        fetch();
    }, [fetch]);

    const chartData = React.useMemo(
        () =>
            categoryGroups.map((g) => ({
                label: g.categoryName,
                value: g.totalAmount,
                color: g.color,
            })),
        [categoryGroups],
    );

    return {
        categoryGroups,
        chartData,
        totalDisplayLines,
        loading,
        error,
        refetch: fetch,
    } as const;
}
