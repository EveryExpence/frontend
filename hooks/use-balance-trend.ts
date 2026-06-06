import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import { BalanceDataPoint, calculateBalanceTrend } from "@/utils/trendCalculations";

export const useBalanceTrend = (accountId?: string) => {
    const db = useSQLiteContext();
    const [data, setData] = React.useState<BalanceDataPoint[]>([]);
    const [percentageChange, setPercentageChange] = React.useState<number>(0);
    const [currency, setCurrency] = React.useState<string>("PLN");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchTrend = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);
            const now = new Date();
            const start = new Date();
            start.setDate(now.getDate() - 30);
            
            const result = await calculateBalanceTrend(db, start, now, accountId);
            
            setData(result.points);
            setPercentageChange(result.percentageChange);
            setCurrency(result.primaryCurrency);
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [db, accountId]);

    React.useEffect(() => {
        fetchTrend();
    }, [fetchTrend]);

    return { data, percentageChange, currency, loading, error, refetch: fetchTrend };
};
