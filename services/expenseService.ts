import { apiFetch } from "@/utils/apiFetch";
import { getExpenseRecordsEndpoint } from "@/constants/endpoints";
import { ExpenseRecord } from "@/types/data/expenseRecord";

function parseCreatedAt(date?: string, time?: string): number | undefined {
    if (!date) return undefined;
    const iso = time ? `${date}T${time}` : `${date}T00:00:00`;
    const ts = Date.parse(iso);
    return Number.isNaN(ts) ? undefined : ts;
}

export async function fetchExpenseRecords(): Promise<ExpenseRecord[]> {
    const res = await apiFetch(getExpenseRecordsEndpoint);

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.detail ?? err?.message ?? 'Failed to fetch expense records';
        throw new Error(msg);
    }

    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data.map((r: any) => ({
        id: r.id,
        amount: r.amount,
        location: r.location ?? undefined,
        description: r.description ?? "",
        paymentMethodId: r.paymentMethodId ?? "",
        categoryId: r.categoryId ?? "",
        accountId: r.accountId ?? "",
        createdAt: parseCreatedAt(r.date, r.time),
        syncState: "synchronized",
    } as ExpenseRecord));
}
