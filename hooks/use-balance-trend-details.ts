import { useSQLiteContext } from "expo-sqlite";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { getAllCategories } from "@/data/categories";
import { getAllAccounts } from "@/data/accounts";
import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { BalanceDataPoint, calculateBalanceTrend } from "@/utils/trendCalculations";

export interface IncomeSource {
    categoryId: string;
    categoryName: string;
    amount: number;
    displayAmount: string;
    currency: string;
}

export interface SpendingSource {
    categoryId: string;
    categoryName: string;
    amount: number;
    displayAmount: string;
    currency: string;
}

export const useBalanceTrendDetails = (startDate: Date, endDate: Date) => {
    const db = useSQLiteContext();
    const [data, setData] = React.useState<BalanceDataPoint[]>([]);
    const [percentageChange, setPercentageChange] = React.useState<number>(0);
    const [incomeSources, setIncomeSources] = React.useState<IncomeSource[]>([]);
    const [spendingSources, setSpendingSources] = React.useState<SpendingSource[]>([]);
    const [currency, setCurrency] = React.useState<string>("PLN");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchData = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);
            
            // 1. Get Trend Data using shared utility
            const trendResult = await calculateBalanceTrend(db, startDate, endDate);
            setData(trendResult.points);
            setPercentageChange(trendResult.percentageChange);
            setCurrency(trendResult.primaryCurrency);

            // 2. Calculate Sources
            const [categories, records, accounts] = await Promise.all([
                getAllCategories(db),
                getAllExpenseRecords(db),
                getAllAccounts(db)
            ]);

            const categoryMap: Record<string, string> = {};
            categories.forEach(c => categoryMap[c.id] = c.name);

            const accountCurrencyMap: Record<string, string> = {};
            accounts.forEach(a => accountCurrencyMap[a.id] = a.currency);

            const startTs = startDate.getTime();
            const endTs = endDate.getTime();

            // 2.1 Calculate Income Sources
            const incomeRecords = records.filter(r => {
                if (r.amount <= 0 || r.syncState === 'deleted') return false;
                const ts = typeof r.createdAt === 'number' ? r.createdAt : new Date(r.createdAt ?? 0).getTime();
                return ts >= startTs && ts <= endTs;
            });

            const incomeGroupMap = new Map<string, { total: number, currency: string }>();
            incomeRecords.forEach(r => {
                const catId = r.categoryId ?? "uncategorized";
                const curr = accountCurrencyMap[r.accountId] ?? "PLN";
                const existing = incomeGroupMap.get(catId) ?? { total: 0, currency: curr };
                existing.total += r.amount;
                incomeGroupMap.set(catId, existing);
            });

            const iSources: IncomeSource[] = Array.from(incomeGroupMap.entries())
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 3)
                .map(([catId, d]) => ({
                    categoryId: catId,
                    categoryName: categoryMap[catId] ?? "Other",
                    amount: d.total,
                    displayAmount: formatCurrency(d.total, d.currency),
                    currency: d.currency
                }));
            setIncomeSources(iSources);

            // 2.2 Calculate Spending Sources
            const spendingRecords = records.filter(r => {
                if (r.amount >= 0 || r.syncState === 'deleted') return false;
                const ts = typeof r.createdAt === 'number' ? r.createdAt : new Date(r.createdAt ?? 0).getTime();
                return ts >= startTs && ts <= endTs;
            });

            const spendingGroupMap = new Map<string, { totalAbs: number, currency: string }>();
            spendingRecords.forEach(r => {
                const catId = r.categoryId ?? "uncategorized";
                const curr = accountCurrencyMap[r.accountId] ?? "PLN";
                const existing = spendingGroupMap.get(catId) ?? { totalAbs: 0, currency: curr };
                existing.totalAbs += Math.abs(r.amount);
                spendingGroupMap.set(catId, existing);
            });

            const sSources: SpendingSource[] = Array.from(spendingGroupMap.entries())
                .sort((a, b) => b[1].totalAbs - a[1].totalAbs)
                .slice(0, 3)
                .map(([catId, d]) => ({
                    categoryId: catId,
                    categoryName: categoryMap[catId] ?? "Other",
                    amount: d.totalAbs,
                    displayAmount: formatCurrency(d.totalAbs, d.currency),
                    currency: d.currency
                }));
            setSpendingSources(sSources);

        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [db, startDate.getTime(), endDate.getTime()]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, percentageChange, incomeSources, spendingSources, currency, loading, error, refetch: fetchData };
};
