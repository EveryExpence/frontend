import React from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllExpenseRecords } from '@/data/expenseRecords';
import { getAllAccounts } from '@/data/accounts';
import { getAllCategories } from '@/data/categories';
import { getAllPaymentMethods } from '@/data/paymentMethods';
import { formatCurrency } from '@/utils/formatCurrency';
import { fetchExchangeRates, convertAmountToUSD } from '@/utils/exchangeRates';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/authContext';

export interface TransactionRecord {
    id: string;
    title: string;
    amount: number;
    currency: string;
    kind: 'income' | 'expense';
    dateLabel: string;
    categoryName: string;
    paymentMethodName: string;
    location?: string;
}

export interface TransactionSection {
    id: string;
    title: string;
    summary: string;
    items: TransactionRecord[];
}

export function useExpenseRecords(accountId?: string) {
    const db = useSQLiteContext();
    const { t } = useTranslation();
    const [records, setRecords] = React.useState<TransactionRecord[]>([]);
    const [rates, setRates] = React.useState<Record<string, number>>({});
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { user } = useAuth();
    const convertToUSD = !!user;

    const formatDateLabel = React.useCallback((ts?: number) => {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = d.toDateString() === yesterday.toDateString();
        if (isToday) return t('common.today');
        if (isYesterday) return t('common.yesterday');
        return d.toLocaleDateString();
    }, [t]);

    const fetch = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);
            setError(null);
            let [local, accounts, categories, paymentMethods] = await Promise.all([
                getAllExpenseRecords(db),
                getAllAccounts(db),
                getAllCategories(db),
                getAllPaymentMethods(db)
            ]);

            if (convertToUSD) {
                const fetchedRates = await fetchExchangeRates("USD");
                setRates(fetchedRates);
            }

            if (accountId) {
                local = local.filter(r => r.accountId === accountId);
            }

            const accountMap: Record<string, string> = {};
            accounts.forEach((a) => (accountMap[a.id] = a.currency));

            const categoryMap: Record<string, string> = {};
            categories.forEach((c) => (categoryMap[c.id] = c.name));

            const paymentMethodMap: Record<string, string> = {};
            paymentMethods.forEach((pm) => (paymentMethodMap[pm.id] = pm.name));

            const mapped: TransactionRecord[] = local
                .slice()
                .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
                .map((r) => ({
                    id: r.id,
                    title: r.description || 'Payment',
                    amount: r.amount,
                    currency: accountMap[r.accountId] ?? 'PLN',
                    kind: r.amount >= 0 ? 'income' : 'expense',
                    dateLabel: formatDateLabel(r.createdAt),
                    categoryName: categoryMap[r.categoryId] ?? t('records.uncategorized'),
                    paymentMethodName: paymentMethodMap[r.paymentMethodId] ?? t('common.other'),
                    location: r.location,
                }));

            setRecords(mapped);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            setError(msg);
            Toast.show({ type: "error", text1: t('records.load_failed'), text2: msg });
        } finally {
            setLoading(false);
        }
    }, [db, accountId, convertToUSD]);

    React.useEffect(() => {
        fetch();
    }, [fetch]);

    const sections = React.useMemo(() => {
        const map = new Map<string, TransactionRecord[]>();
        records.forEach((r) => {
            const key = r.dateLabel || t('common.other');
            const arr = map.get(key) ?? [];
            arr.push(r);
            map.set(key, arr);
        });

        return Array.from(map.entries()).map(([title, items], idx) => {
            let summary = '';
            if (convertToUSD) {
                let usdTotal = 0;
                items.forEach((it) => {
                    usdTotal += convertAmountToUSD(it.amount, it.currency, rates);
                });
                summary = formatCurrency(usdTotal, "USD");
            } else {
                const totals: Record<string, number> = {};
                items.forEach((it) => {
                    totals[it.currency] = (totals[it.currency] || 0) + it.amount;
                });
                summary = Object.entries(totals)
                    .map(([curr, sum]) => formatCurrency(sum, curr))
                    .join(' | ');
            }

            return {
                id: `section-${idx}`,
                title,
                summary,
                items,
            };
        });
    }, [records, convertToUSD, rates]);

    return { records, sections, loading, error, refetch: fetch } as const;
}
