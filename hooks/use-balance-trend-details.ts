import { useSQLiteContext } from "expo-sqlite";
import { getAllAccounts, getAccountBalance } from "@/data/accounts";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { getAllCategories } from "@/data/categories";
import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";

export interface BalanceDataPoint {
    day: string;
    balance: number;
    [key: string]: unknown;
}

export interface IncomeSource {
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
    const [currency, setCurrency] = React.useState<string>("PLN");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchData = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);
            const [accounts, records, categories] = await Promise.all([
                getAllAccounts(db),
                getAllExpenseRecords(db),
                getAllCategories(db)
            ]);
            
            if (accounts.length > 0) {
                setCurrency(accounts[0].currency);
            }

            const categoryMap: Record<string, string> = {};
            categories.forEach(c => categoryMap[c.id] = c.name);

            const accountCurrencyMap: Record<string, string> = {};
            accounts.forEach(a => accountCurrencyMap[a.id] = a.currency);

            // 1. Calculate Income Sources for the period
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
                const existing = incomeGroupMap.get(catId) ?? { total: 0, currency: curr };
                existing.total += r.amount;
                incomeGroupMap.set(catId, existing);
            });

            const sources: IncomeSource[] = Array.from(incomeGroupMap.entries())
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 3)
                .map(([catId, d]) => ({
                    categoryId: catId,
                    categoryName: categoryMap[catId] ?? "Other",
                    amount: d.total,
                    displayAmount: formatCurrency(d.total, d.currency),
                    currency: d.currency
                }));
            setIncomeSources(sources);

            // 2. Calculate Trend Points
            // We need to know the balance at the end of the selected period (endDate)
            // and then work backwards to startDate.
            
            // First, find current balance
            let currentBalance = 0;
            for (const acc of accounts) {
                const bal = await getAccountBalance(db, acc.id);
                currentBalance += bal;
            }

            const sortedRecords = [...records]
                .filter(r => r.syncState !== 'deleted')
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt ?? 0).getTime();
                    const dateB = new Date(b.createdAt ?? 0).getTime();
                    return dateB - dateA;
                });

            let tempBalance = currentBalance;
            let recordIdx = 0;
            const now = new Date();
            
            // Move backwards from now to endDate
            const endOfPeriod = new Date(endDate);
            while (recordIdx < sortedRecords.length) {
                const createdAt = sortedRecords[recordIdx].createdAt;
                const rDate = createdAt ? new Date(createdAt) : new Date(0);
                if (rDate > endOfPeriod) {
                    tempBalance -= sortedRecords[recordIdx].amount;
                    recordIdx++;
                } else {
                    break;
                }
            }

            const points: BalanceDataPoint[] = [];
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Limit points to avoid performance issues if range is huge
            const step = Math.max(1, Math.ceil(diffDays / 30));

            for (let i = 0; i <= diffDays; i += step) {
                const d = new Date(endDate);
                d.setDate(d.getDate() - i);
                if (d < startDate && i !== 0) break;
                
                // Adjust for startDate precisely at the end
                const targetDate = d < startDate ? startDate : d;

                while (recordIdx < sortedRecords.length) {
                    const createdAt = sortedRecords[recordIdx].createdAt;
                    const rDate = createdAt ? new Date(createdAt) : new Date(0);
                    if (rDate > targetDate) {
                        tempBalance -= sortedRecords[recordIdx].amount;
                        recordIdx++;
                    } else {
                        break;
                    }
                }

                points.push({ 
                    day: targetDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), 
                    balance: tempBalance 
                });
                if (targetDate === startDate) break;
            }

            const reversedPoints = points.reverse();
            setData(reversedPoints);

            if (reversedPoints.length > 0) {
                const initialBalance = reversedPoints[0].balance;
                const finalBalance = reversedPoints[reversedPoints.length - 1].balance;
                
                if (initialBalance !== 0) {
                    setPercentageChange(((finalBalance - initialBalance) / Math.abs(initialBalance)) * 100);
                } else if (finalBalance !== 0) {
                    setPercentageChange(100);
                } else {
                    setPercentageChange(0);
                }
            } else {
                setPercentageChange(0);
            }

        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [db, startDate.getTime(), endDate.getTime()]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, percentageChange, incomeSources, currency, loading, error, refetch: fetchData };
};
