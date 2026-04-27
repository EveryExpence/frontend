import { Account, AccountInputDTO } from "@/types/data/account";
import { SQLiteDatabase } from "expo-sqlite"
import { nanoid } from 'nanoid'

export const createAccount = async (db: SQLiteDatabase, accountDTO: AccountInputDTO) => {
    const stmt = await db.prepareAsync(`
        INSERT INTO accounts (id, name, currency, balance) VALUES ($id, $name, $currency, $balance);
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: nanoid(),
            $name: accountDTO.name,
            $currency: accountDTO.currency,
            $balance: accountDTO.balance,
        });
    });
};

export const getAccountBalance = async (db: SQLiteDatabase, id: string): Promise<number> => {
    const stmt = await db.prepareAsync(`
        SELECT SUM(er.amount) + a.balance AS 'balance'
        FROM accounts AS a
        JOIN expense_records AS er
        ON a.id = er.accountId
        WHERE a.id = $id AND a.syncState != 'deleted' AND er.syncState != 'deleted';
    `);

    let ans = 0;
    await db.withExclusiveTransactionAsync(async () => {
        const res = await stmt.executeAsync({
            $id: id,
        });

        const data = await res.getFirstAsync();
        if (data !== null && data !== undefined && typeof data === "object") {
            const { balance } = data as any;
            ans = balance;
        }
    });
    return ans;
};

export const getAllAccounts = async (db: SQLiteDatabase): Promise<Account[]> => {
    return await db.getAllAsync<Account>("SELECT * FROM accounts");
};

export const updateAccount = async (db: SQLiteDatabase, id: string, accountDTO: AccountInputDTO) => {
    const stmt = await db.prepareAsync(`
        UPDATE accounts SET
            name = $name,
            currency = $currency,
            balance = $balance,
            syncState = CASE
                WHEN syncState = 'created' THEN 'created'
                ELSE 'updated'
            END
        WHERE id = $id AND syncState != 'deleted';
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
            $name: accountDTO.name,
            $currency: accountDTO.currency,
            $balance: accountDTO.balance,
        });
    });
};

export const deleteAccount = async (db: SQLiteDatabase, id: string) => {
    const stmt = await db.prepareAsync(`
        DELETE FROM accounts WHERE id = $id;
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
        });
    });
};