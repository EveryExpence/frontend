import React from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllExpenseRecords } from '@/data/expenseRecords';
import { getAllCategories } from '@/data/categories';
import { getAllAccounts } from '@/data/accounts';
import { ExpenseRecord } from '@/types/data/expenseRecord';
import { Category } from '@/types/data/category';
import { formatCurrency } from '@/utils/formatCurrency';

const DEFAULT_COLORS = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#2DD4BF',
    '#F472B6',
];

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

export function useSpendingInsights(startDate: Date, endDate: Date) {
    const db = useSQLiteContext();
    const [categoryGroups, setCategoryGroups] = React.useState<CategoryGroup[]>([]);
    const [totalDisplay, setTotalDisplay] = React.useState('');
    const [totalValue, setTotalValue] = React.useState(0);
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
                if (r.amount >= 0) return false;
                if (!r.createdAt) return false;
                const ts = typeof r.createdAt === 'number' ? r.createdAt : new Date(r.createdAt).getTime();
                return ts >= startTs && ts <= endTs;
            });

            const groupMap = new Map<string, { records: ExpenseRecord[]; totalAbs: number; currency: string }>();

            filtered.forEach((r) => {
                const catId = r.categoryId ?? 'uncategorized';
                const currency = accountCurrencyMap[r.accountId] ?? 'PLN';
                const existing = groupMap.get(catId) ?? { records: [], totalAbs: 0, currency };
                existing.records.push(r);
                existing.totalAbs += Math.abs(r.amount);
                groupMap.set(catId, existing);
            });

            const sortedEntries = Array.from(groupMap.entries()).sort(
                (a, b) => b[1].totalAbs - a[1].totalAbs,
            );

            let grandTotal = 0;
            let primaryCurrency = 'PLN';
            if (sortedEntries.length > 0) {
                primaryCurrency = sortedEntries[0][1].currency;
            }

            const groups: CategoryGroup[] = sortedEntries.map(([catId, data], idx) => {
                grandTotal += data.totalAbs;
                const catName = categoryMap[catId]?.name ?? 'Other';

                const items: CategoryExpenseItem[] = data.records
                    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                    .map((r) => ({
                        id: r.id,
                        description: r.description || 'Payment',
                        amount: r.amount,
                        currency: accountCurrencyMap[r.accountId] ?? 'PLN',
                        createdAt: r.createdAt,
                    }));

                return {
                    categoryId: catId,
                    categoryName: catName,
                    totalAmount: data.totalAbs,
                    displayAmount: formatCurrency(-data.totalAbs, data.currency),
                    color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                    currency: data.currency,
                    items,
                };
            });

            setCategoryGroups(groups);
            setTotalValue(grandTotal);
            setTotalDisplay(formatCurrency(grandTotal, primaryCurrency));
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [db, startDate.getTime(), endDate.getTime()]);

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
        totalDisplay,
        totalValue,
        loading,
        error,
        refetch: fetch,
    } as const;
}
