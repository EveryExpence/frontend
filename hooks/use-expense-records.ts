import React from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllExpenseRecords } from '@/data/expenseRecords';
import { getAllAccounts } from '@/data/accounts';
import { formatCurrency } from '@/utils/formatCurrency';

export interface TransactionRecord {
    id: string;
    title: string;
    amount: number;
    currency: string;
    kind: 'income' | 'expense';
    dateLabel: string;
}

export interface TransactionSection {
    id: string;
    title: string;
    summary: string;
    items: TransactionRecord[];
}

function formatDateLabel(ts?: number) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return d.toLocaleDateString();
}

export function useExpenseRecords() {
    const db = useSQLiteContext();
    const [records, setRecords] = React.useState<TransactionRecord[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetch = React.useCallback(async () => {
        if (!db) return;
        try {
            setLoading(true);
            setError(null);
            const local = await getAllExpenseRecords(db);
            const accounts = await getAllAccounts(db);
            const accountMap: Record<string, string> = {};
            accounts.forEach((a) => (accountMap[a.id] = a.currency));

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
                }));

            setRecords(mapped);
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [db]);

    React.useEffect(() => {
        fetch();
    }, [fetch]);

    const sections = React.useMemo(() => {
        const map = new Map<string, TransactionRecord[]>();
        records.forEach((r) => {
            const key = r.dateLabel || 'Other';
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
    }, [records]);

    return { records, sections, loading, error, refetch: fetch } as const;
}
