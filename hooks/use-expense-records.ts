import React from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllExpenseRecords } from '@/data/expenseRecords';
import { getAllAccounts } from '@/data/accounts';
import { getAllCategories } from '@/data/categories';
import { Category } from '@/types/data/category';
import { getAllPaymentMethods } from '@/data/paymentMethods';
import { formatCurrency } from '@/utils/formatCurrency';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

export interface TransactionRecord {
    id: string;
    title: string;
    amount: number;
    currency: string;
    kind: 'income' | 'expense';
    dateLabel: string;
    categoryName: string;
    categoryIcon?: string;
    paymentMethodName: string;
    location?: string;
    changeRate?: number;
    createdAtTime: number;
    accountId: string;
    accountName: string;
}

export interface TransactionSection {
    id: string;
    title: string;
    summary: string;
    items: TransactionRecord[];
}

export function useExpenseRecords(accountId?: string, scope: 'total' | 'account' = 'account') {
    const db = useSQLiteContext();
    const { t } = useTranslation();
    const [records, setRecords] = React.useState<TransactionRecord[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [exchangeRates, setExchangeRates] = React.useState<Record<string, number>>({});
    const isTotalScope = scope === 'total';

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

            const accountMap: Record<string, { currency: string; name: string }> = {};
            accounts.forEach((a) => (accountMap[a.id] = { currency: a.currency, name: a.name }));

            if (!isTotalScope && accountId) {
                local = local.filter(r => r.accountId === accountId);
            }

            const categoryMap: Record<string, Category> = {};
            categories.forEach((c) => (categoryMap[c.id] = c));

            const paymentMethodMap: Record<string, string> = {};
            paymentMethods.forEach((pm) => (paymentMethodMap[pm.id] = pm.name));

            const { fetchExchangeRates, convertAmount } = await import('@/utils/exchangeRates');
            const rates = await fetchExchangeRates('USD');
            setExchangeRates(rates);
            const canConvert = Object.keys(rates).length > 1;

            let mapped = local
                .slice()
                .sort((a, b) => {
                    const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
                    const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
                    return timeA - timeB;
                })
                .map((r) => {
                    const originalCurrency = accountMap[r.accountId]?.currency ?? "PLN";
                    const accountName = accountMap[r.accountId]?.name ?? "Account";
                    const categoryName = categoryMap[r.categoryId]?.name ?? t('records.uncategorized');
                    return {
                        id: r.id,
                        title: r.description || categoryName,
                        amount: r.amount,
                        currency: originalCurrency,
                        kind: r.amount >= 0 ? 'income' : 'expense',
                        dateLabel: formatDateLabel(r.createdAt),
                        categoryName,
                        categoryIcon: categoryMap[r.categoryId]?.icon,
                        paymentMethodName: paymentMethodMap[r.paymentMethodId] ?? t('common.other'),
                        location: r.location,
                        createdAtTime: typeof r.createdAt === 'number' ? r.createdAt : new Date(r.createdAt || 0).getTime(),
                        accountId: r.accountId,
                        accountName: accountName
                    };
                });

            let runningBalanceUSD = 0;
            for (const acc of accounts) {
                if (!accountId || acc.id === accountId) {
                    runningBalanceUSD += canConvert ? convertAmount(acc.balance, acc.currency, 'USD', rates) : acc.balance;
                }
            }

            for (let i = 0; i < mapped.length; i++) {
                const r = mapped[i];
                const amtUSD = canConvert ? convertAmount(r.amount, r.currency, 'USD', rates) : r.amount;
                
                let changeRate: number | undefined = undefined;
                if (Math.abs(runningBalanceUSD) > 0.01) {
                    changeRate = (amtUSD / Math.abs(runningBalanceUSD)) * 100;
                }
                
                (r as any).changeRate = changeRate;
                r.amount = Math.abs(r.amount);
                runningBalanceUSD += amtUSD;
            }

            mapped.sort((a, b) => b.createdAtTime - a.createdAtTime);

            setRecords(mapped as TransactionRecord[]);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            setError(msg);
            Toast.show({ type: "error", text1: t('records.load_failed'), text2: msg });
        } finally {
            setLoading(false);
        }
    }, [db, accountId, isTotalScope]);

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

        const { convertAmount } = require('@/utils/exchangeRates');
        const canConvert = Object.keys(exchangeRates).length > 1;

        return Array.from(map.entries()).map(([title, items], idx) => {
            let totalUSD = 0;
            items.forEach((it) => {
                let amt = it.kind === 'income' ? it.amount : -it.amount;
                if (canConvert) {
                    totalUSD += convertAmount(amt, it.currency, 'USD', exchangeRates);
                } else {
                    totalUSD += amt;
                }
            });
            const summary = formatCurrency(Math.abs(totalUSD), canConvert ? 'USD' : (items[0]?.currency ?? 'USD'));
            const summaryPrefix = totalUSD >= 0 ? '+' : '-';

            return {
                id: `section-${idx}`,
                title,
                summary: summaryPrefix + summary,
                items,
            };
        });
    }, [records, t, exchangeRates]);

    return { records, sections, loading, error, refetch: fetch } as const;
}
