import React from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllExpenseRecords } from '@/data/expenseRecords';
import { getAllAccounts } from '@/data/accounts';
import { getAllCategories } from '@/data/categories';
import { Category } from '@/types/data/category';
import { getAllPaymentMethods } from '@/data/paymentMethods';
import { formatCurrency } from '@/utils/formatCurrency';
import { fetchExchangeRates, convertAmount } from '@/utils/exchangeRates';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useBaseCurrency } from '@/context/baseCurrencyContext';

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
    const [rates, setRates] = React.useState<Record<string, number>>({});
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { baseCurrency } = useBaseCurrency();
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

            const accountMap: Record<string, string> = {};
            accounts.forEach((a) => (accountMap[a.id] = a.currency));

            let displayRates: Record<string, number> = {};
            if (isTotalScope) {
                const distinctCurrencies = new Set(
                    local.map((r) => accountMap[r.accountId]).filter((c): c is string => Boolean(c)),
                );
                const needsConversion =
                    distinctCurrencies.size > 0 &&
                    Array.from(distinctCurrencies).some(
                        (c) => c.toUpperCase() !== baseCurrency.toUpperCase(),
                    );
                if (needsConversion) {
                    displayRates = await fetchExchangeRates(baseCurrency);
                    setRates(displayRates);
                } else {
                    setRates({});
                }
            } else {
                setRates({});
            }

            if (!isTotalScope && accountId) {
                local = local.filter(r => r.accountId === accountId);
            }

            const categoryMap: Record<string, Category> = {};
            categories.forEach((c) => (categoryMap[c.id] = c));

            const paymentMethodMap: Record<string, string> = {};
            paymentMethods.forEach((pm) => (paymentMethodMap[pm.id] = pm.name));

            const mapped: TransactionRecord[] = local
                .slice()
                .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
                .map((r) => {
                    const originalCurrency = accountMap[r.accountId] ?? baseCurrency;
                    let displayAmount = r.amount;
                    let displayCurrency = originalCurrency;
                    if (isTotalScope) {
                        displayAmount = convertAmount(
                            r.amount,
                            originalCurrency,
                            baseCurrency,
                            displayRates,
                        );
                        displayCurrency = baseCurrency;
                    }
                    return {
                        id: r.id,
                        title: r.description || 'Payment',
                        amount: displayAmount,
                        currency: displayCurrency,
                        kind: r.amount >= 0 ? 'income' : 'expense',
                        dateLabel: formatDateLabel(r.createdAt),
                        categoryName: categoryMap[r.categoryId]?.name ?? t('records.uncategorized'),
                        categoryIcon: categoryMap[r.categoryId]?.icon,
                        paymentMethodName: paymentMethodMap[r.paymentMethodId] ?? t('common.other'),
                        location: r.location,
                    };
                });

            setRecords(mapped);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            setError(msg);
            Toast.show({ type: "error", text1: t('records.load_failed'), text2: msg });
        } finally {
            setLoading(false);
        }
    }, [db, accountId, isTotalScope, baseCurrency]);

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
            const totals: Record<string, number> = {};
            items.forEach((it) => {
                totals[it.currency] = (totals[it.currency] || 0) + it.amount;
            });
            const summary = Object.entries(totals)
                .map(([curr, sum]) => formatCurrency(sum, curr))
                .join(' | ');

            return {
                id: `section-${idx}`,
                title,
                summary,
                items,
            };
        });
    }, [records, t]);

    return { records, sections, loading, error, refetch: fetch } as const;
}
