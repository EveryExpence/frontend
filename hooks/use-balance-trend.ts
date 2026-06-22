import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import { BalanceDataPoint, calculateBalanceTrend } from "@/utils/trendCalculations";
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/authContext';

export const useBalanceTrend = (accountId?: string) => {
    const db = useSQLiteContext();
    const [data, setData] = React.useState<BalanceDataPoint[]>([]);
    const [percentageChange, setPercentageChange] = React.useState<number>(0);
    const [currency, setCurrency] = React.useState<string>("PLN");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { t } = useTranslation();
    const { user } = useAuth();
    const convertToUSD = !!user;

    const fetchTrend = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);
            const now = new Date();
            const start = new Date();
            start.setDate(now.getDate() - 30);
            
            const result = await calculateBalanceTrend(db, start, now, accountId, convertToUSD);
            
            setData(result.points);
            setPercentageChange(result.percentageChange);
            setCurrency(result.primaryCurrency);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            setError(msg);
            Toast.show({ type: "error", text1: t('balance_trend.load_failed'), text2: msg });
        } finally {
            setLoading(false);
        }
    }, [db, accountId, convertToUSD]);

    React.useEffect(() => {
        fetchTrend();
    }, [fetchTrend]);

    return { data, percentageChange, currency, loading, error, refetch: fetchTrend };
};
