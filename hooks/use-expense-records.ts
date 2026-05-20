import React from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllExpenseRecords } from '@/data/expenseRecords';
import { TransactionRecord } from '@/components/dashboard/widgets/mockTransactions';

function formatDateLabel(ts?: number) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    if (isToday) return `Today  ${time}`;
    if (isYesterday) return `Yesterday  ${time}`;
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
            const mapped: TransactionRecord[] = local
                .slice()
                .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
                .map((r) => ({
                    id: r.id,
                    title: r.description || 'Payment',
                    amount: r.amount,
                    currency: 'PLN',
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

        return Array.from(map.entries()).map(([title, items], idx) => ({
            id: `section-${idx}`,
            title,
            summary: '',
            items,
        }));
    }, [records]);

    return { records, sections, loading, error, refetch: fetch } as const;
}
