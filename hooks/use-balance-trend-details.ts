import { useSQLiteContext } from "expo-sqlite";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { getAllCategories } from "@/data/categories";
import { getAllAccounts } from "@/data/accounts";
import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchExchangeRates, convertAmountToUSD } from "@/utils/exchangeRates";
import { BalanceDataPoint, calculateBalanceTrend } from "@/utils/trendCalculations";
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/context/authContext";

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

export const useBalanceTrendDetails = (startDate: Date, endDate: Date, accountId?: string) => {
    const db = useSQLiteContext();
    const [data, setData] = React.useState<BalanceDataPoint[]>([]);
    const [percentageChange, setPercentageChange] = React.useState<number>(0);
    const [incomeSources, setIncomeSources] = React.useState<IncomeSource[]>([]);
    const [spendingSources, setSpendingSources] = React.useState<SpendingSource[]>([]);
    const [currency, setCurrency] = React.useState<string>("PLN");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { t } = useTranslation();
    const { user } = useAuth();
    const convertToUSD = !!user;

    const fetchData = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);

            const trendResult = await calculateBalanceTrend(db, startDate, endDate, accountId, convertToUSD);
            setData(trendResult.points);
            setPercentageChange(trendResult.percentageChange);
            setCurrency(convertToUSD ? "USD" : trendResult.primaryCurrency);

            let rates: Record<string, number> = {};
            if (convertToUSD) {
                rates = await fetchExchangeRates("USD");
            }

            const [categories, allRecords, accounts] = await Promise.all([
                getAllCategories(db),
                getAllExpenseRecords(db),
                getAllAccounts(db)
            ]);
            
            const records = accountId ? allRecords.filter(r => r.accountId === accountId) : allRecords;

            const categoryMap: Record<string, string> = {};
            categories.forEach(c => categoryMap[c.id] = c.name);

            const accountCurrencyMap: Record<string, string> = {};
            accounts.forEach(a => accountCurrencyMap[a.id] = a.currency);

            const startTs = startDate.getTime();
            const endTs = endDate.getTime();

            const incomeRecords = records.filter(r => {
                if (r.amount <= 0 || r.syncState === 'deleted') return false;
                const ts = typeof r.createdAt === 'number' ? r.createdAt : new Date(r.createdAt ?? 0).getTime();
                return ts >= startTs && ts <= endTs;
            });

            const incomeGroupMap = new Map<string, { total: number, currency: string }>();
            incomeRecords.forEach(r => {
                const catId = r.categoryId ?? "uncategorized";
                const curr = accountCurrencyMap[r.accountId] ?? "PLN";
                let amt = r.amount;
                let c = curr;

                if (convertToUSD) {
                    amt = convertAmountToUSD(amt, curr, rates);
                    c = "USD";
                }

                const existing = incomeGroupMap.get(catId) ?? { total: 0, currency: c };
                existing.total += amt;
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

            const spendingRecords = records.filter(r => {
                if (r.amount >= 0 || r.syncState === 'deleted') return false;
                const ts = typeof r.createdAt === 'number' ? r.createdAt : new Date(r.createdAt ?? 0).getTime();
                return ts >= startTs && ts <= endTs;
            });

            const spendingGroupMap = new Map<string, { totalAbs: number, currency: string }>();
            spendingRecords.forEach(r => {
                const catId = r.categoryId ?? "uncategorized";
                const curr = accountCurrencyMap[r.accountId] ?? "PLN";
                let amt = Math.abs(r.amount);
                let c = curr;

                if (convertToUSD) {
                    amt = convertAmountToUSD(amt, curr, rates);
                    c = "USD";
                }

                const existing = spendingGroupMap.get(catId) ?? { totalAbs: 0, currency: c };
                existing.totalAbs += amt;
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
            const msg = e?.message ?? String(e);
            setError(msg);
            Toast.show({ type: "error", text1: t('balance_trend.load_details_failed'), text2: msg });
        } finally {
            setLoading(false);
        }
    }, [db, startDate.getTime(), endDate.getTime(), accountId, convertToUSD]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, percentageChange, incomeSources, spendingSources, currency, loading, error, refetch: fetchData };
};
