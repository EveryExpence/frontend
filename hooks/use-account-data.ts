import { useSQLiteContext } from "expo-sqlite";
import { getAllAccounts as getAllLocalAccounts, getAccountBalance } from "@/data/accounts";
import { Account } from "@/types/data/account";
import React from "react";

export type AccountWithComputed = Account & { computedBalance: number };

export const useAccountsData = () => {
    const [accounts, setAccounts] = React.useState<AccountWithComputed[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const db = useSQLiteContext();

    const fetchAccounts = React.useCallback(async () => {
        if (!db) return;

        try {
            setLoading(true);
            setError(null);

            const localAccounts = await getAllLocalAccounts(db);
            const accountsWithBalances: AccountWithComputed[] = await Promise.all(
                localAccounts.map(async (a: Account) => {
                    try {
                        const computed = await getAccountBalance(db, a.id);
                        return {
                            ...a,
                            computedBalance: Number(computed ?? a.balance ?? 0),
                        };
                    } catch {
                        return { ...a, computedBalance: Number(a.balance ?? 0) };
                    }
                }),
            );

            setAccounts(accountsWithBalances);
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [db]);

    React.useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const totalsByCurrency = React.useMemo(() => {
        const map: Record<string, number> = {};
        accounts.forEach((a) => {
            map[a.currency] = (map[a.currency] || 0) + (a.computedBalance ?? 0);
        });
        return map;
    }, [accounts]);
    return { accounts, loading, error, totalsByCurrency, refetch: fetchAccounts };
}