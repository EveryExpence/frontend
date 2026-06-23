import { SQLiteDatabase } from "expo-sqlite";
import { getAllAccounts, getAccountBalance } from "@/data/accounts";
import { getAllExpenseRecords } from "@/data/expenseRecords";
import { convertAmount } from "@/utils/exchangeRates";

export interface BalanceDataPoint {
    day: string;
    balance: number;
    [key: string]: unknown;
}

export const calculateBalanceTrend = async (
    db: SQLiteDatabase,
    startDate: Date,
    endDate: Date,
    accountId?: string,
    options?: {
        shouldConvert: boolean;
        baseCurrency: string;
        rates: Record<string, number>;
    }
): Promise<{ points: BalanceDataPoint[]; percentageChange: number; primaryCurrency: string }> => {
    const [allAccounts, allRecords] = await Promise.all([
        getAllAccounts(db),
        getAllExpenseRecords(db),
    ]);

    const accounts = accountId ? allAccounts.filter(a => a.id === accountId) : allAccounts;
    const records = accountId ? allRecords.filter(r => r.accountId === accountId) : allRecords;

    const accountCurrencyMap: Record<string, string> = {};
    accounts.forEach((a) => (accountCurrencyMap[a.id] = a.currency));

    let primaryCurrency = options?.shouldConvert ? options.baseCurrency : (accounts.length > 0 ? accounts[0].currency : "PLN");

    let currentBalance = 0;
    for (const acc of accounts) {
        let bal = await getAccountBalance(db, acc.id);
        if (options?.shouldConvert) {
            bal = convertAmount(bal, acc.currency, options.baseCurrency, options.rates);
        }
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

    const endOfPeriod = new Date(endDate);
    while (recordIdx < sortedRecords.length) {
        const createdAt = sortedRecords[recordIdx].createdAt;
        const rDate = createdAt ? new Date(createdAt) : new Date(0);
        if (rDate > endOfPeriod) {
            const accId = sortedRecords[recordIdx].accountId;
            let amt = sortedRecords[recordIdx].amount;
            if (options?.shouldConvert) {
                const currency = accountCurrencyMap[accId] ?? "PLN";
                amt = convertAmount(amt, currency, options.baseCurrency, options.rates);
            }
            tempBalance -= amt;
            recordIdx++;
        } else {
            break;
        }
    }

    const points: BalanceDataPoint[] = [];
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const step = Math.max(1, Math.ceil(diffDays / 30));

    for (let i = 0; i <= diffDays; i += step) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        if (d < startDate && i !== 0) break;

        const targetDate = d < startDate ? startDate : d;

        while (recordIdx < sortedRecords.length) {
            const createdAt = sortedRecords[recordIdx].createdAt;
            const rDate = createdAt ? new Date(createdAt) : new Date(0);
            if (rDate > targetDate) {
                const accId = sortedRecords[recordIdx].accountId;
                let amt = sortedRecords[recordIdx].amount;
                if (options?.shouldConvert) {
                    const currency = accountCurrencyMap[accId] ?? "PLN";
                    amt = convertAmount(amt, currency, options.baseCurrency, options.rates);
                }
                tempBalance -= amt;
                recordIdx++;
            } else {
                break;
            }
        }

        points.push({
            day: targetDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            balance: tempBalance
        });
        if (targetDate.getTime() === startDate.getTime()) break;
    }

    const reversedPoints = points.reverse();

    let percentageChange = 0;
    if (reversedPoints.length > 0) {
        const initialBalance = reversedPoints[0].balance;
        const finalBalance = reversedPoints[reversedPoints.length - 1].balance;

        if (initialBalance !== 0) {
            percentageChange = ((finalBalance - initialBalance) / Math.abs(initialBalance)) * 100;
        } else if (finalBalance !== 0) {
            percentageChange = 100;
        }
    }

    return { points: reversedPoints, percentageChange, primaryCurrency };
};
