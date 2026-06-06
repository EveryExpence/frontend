import { useSQLiteContext } from "expo-sqlite";
import { getAllAccounts, getAccountBalance } from "@/data/accounts";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import React from "react";

export interface BalanceDataPoint {
    day: string;
    balance: number;
    [key: string]: unknown;
}

export const useBalanceTrend = () => {
    const db = useSQLiteContext();
    const [data, setData] = React.useState<BalanceDataPoint[]>([]);
    const [percentageChange, setPercentageChange] = React.useState<number>(0);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [currency, setCurrency] = React.useState<string>("PLN");

    const fetchTrend = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);
            const accounts = await getAllAccounts(db);
            const records = await getAllExpenseRecords(db);
            
            if (accounts.length > 0) {
                setCurrency(accounts[0].currency);
            }
            const now = new Date();
            const points: BalanceDataPoint[] = [];
            
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
            
            const daysToFetch = 30;
            for (let i = 0; i <= daysToFetch; i++) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                d.setHours(23, 59, 59, 999);
                
                while (recordIdx < sortedRecords.length) {
                    const createdAt = sortedRecords[recordIdx].createdAt;
                    const rDate = createdAt ? new Date(createdAt) : new Date(0);
                    if (rDate > d) {
                        tempBalance -= sortedRecords[recordIdx].amount;
                        recordIdx++;
                    } else {
                        break;
                    }
                }
                
                points.push({ 
                    day: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), 
                    balance: tempBalance 
                });
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
    }, [db]);

    React.useEffect(() => {
        fetchTrend();
    }, [fetchTrend]);

    return { data, percentageChange, currency, loading, error, refetch: fetchTrend };
};
