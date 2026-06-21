import React from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { getAllCategories } from "@/data/categories";
import { getAllAccounts } from "@/data/accounts";
import { ExpenseRecord } from "@/types/data/expenseRecord";
import { Category } from "@/types/data/category";
import { formatCurrency } from "@/utils/formatCurrency";
import { CATEGORY_COLORS } from "@/constants/categoryColors";
import Toast from 'react-native-toast-message';

export interface CategoryExpenseItem {
    id: string;
    description: string;
    amount: number;
    currency: string;
    createdAt?: number;
}

export interface CategoryGroup {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    displayAmount: string;
    color: string;
    currency: string;
    items: CategoryExpenseItem[];
}

export function useSpendingInsights(startDate: Date, endDate: Date, accountId?: string) {
    const db = useSQLiteContext();
    const [categoryGroups, setCategoryGroups] = React.useState<CategoryGroup[]>(
        [],
    );
    const [totalDisplayLines, setTotalDisplayLines] = React.useState<string[]>(
        [],
    );
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

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

            const startTs = startDate.getTime();
            const endTs = endDate.getTime();

            const filtered = allRecords.filter((r) => {
                if (accountId && r.accountId !== accountId) return false;
                if (r.amount >= 0) return false;
                if (!r.createdAt) return false;
                const ts =
                    typeof r.createdAt === "number"
                        ? r.createdAt
                        : new Date(r.createdAt).getTime();
                return ts >= startTs && ts <= endTs;
            });

            const groupMap = new Map<
                string,
                { records: ExpenseRecord[]; totalAbs: number; currency: string }
            >();

            filtered.forEach((r) => {
                const catId = r.categoryId ?? "uncategorized";
                const currency = accountCurrencyMap[r.accountId] ?? "PLN";
                const existing = groupMap.get(catId) ?? {
                    records: [],
                    totalAbs: 0,
                    currency,
                };
                existing.records.push(r);
                existing.totalAbs += Math.abs(r.amount);
                groupMap.set(catId, existing);
            });

            const sortedEntries = Array.from(groupMap.entries()).sort(
                (a, b) => b[1].totalAbs - a[1].totalAbs,
            );

            const currencyTotals = new Map<string, number>();
            const groups: CategoryGroup[] = sortedEntries.map(
                ([catId, data], idx) => {
                    const catName = categoryMap[catId]?.name ?? "Other";
                    const prev = currencyTotals.get(data.currency) ?? 0;
                    currencyTotals.set(data.currency, prev + data.totalAbs);

                    const items: CategoryExpenseItem[] = data.records
                        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                        .map((r) => ({
                            id: r.id,
                            description: r.description || "Payment",
                            amount: r.amount,
                            currency: accountCurrencyMap[r.accountId] ?? "PLN",
                            createdAt: r.createdAt,
                        }));

                    return {
                        categoryId: catId,
                        categoryName: catName,
                        totalAmount: data.totalAbs,
                        displayAmount: formatCurrency(-data.totalAbs, data.currency),
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
            const msg = e?.message ?? String(e);
            setError(msg);
            Toast.show({ type: "error", text1: "Failed to load spending insights", text2: msg });
        } finally {
            setLoading(false);
        }
    }, [db, startDate.getTime(), endDate.getTime(), accountId]);

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
