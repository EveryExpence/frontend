import { ExpenseRecord, ExpenseRecordInputDTO, ExpenseRecordResponseDTO } from "@/types/data/expenseRecord";
import { SQLiteDatabase } from "expo-sqlite"
import { nanoid } from 'nanoid'

export const createExpenseRecord = async (db: SQLiteDatabase, expenseRecordDTO: ExpenseRecordInputDTO): Promise<string> => {
    const stmt = await db.prepareAsync(`
        INSERT INTO expense_records (
            id,
            amount,
            location,
            description,
            paymentMethodId,
            categoryId,
            accountId,
            createdAt
        ) VALUES (
            $id,
            $amount,
            $location,
            $description,
            $paymentMethodId,
            $categoryId,
            $accountId,
            CASE
                WHEN $createdAt IS NULL THEN CURRENT_TIMESTAMP
                ELSE $createdAt
            END
        );
    `);

    const id = nanoid();
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
            $amount: expenseRecordDTO.amount,
            $location: expenseRecordDTO.location ?? null,
            $description: expenseRecordDTO.description,
            $paymentMethodId: expenseRecordDTO.paymentMethodId,
            $categoryId: expenseRecordDTO.categoryId,
            $accountId: expenseRecordDTO.accountId,
            $createdAt: expenseRecordDTO.createdAt ?? null,
        });
    });
    return id;
};

export const getAllExpenseRecords = async (db: SQLiteDatabase): Promise<ExpenseRecord[]> => {
    return await db.getAllAsync<ExpenseRecord>("SELECT * FROM expense_records WHERE syncState != 'deleted'");
};

export const getExpenseRecordById = async (db: SQLiteDatabase, id: string): Promise<ExpenseRecord | null> => {
    return await db.getFirstAsync<ExpenseRecord>("SELECT * FROM expense_records WHERE id = $id AND syncState != 'deleted'", {
        $id: id
    });
};

export const updateExpenseRecord = async (db: SQLiteDatabase, id: string, expenseRecordDTO: ExpenseRecordInputDTO) => {
    const stmt = await db.prepareAsync(`
        UPDATE expense_records SET
            amount = $amount,
            location = $location,
            description = $description,
            paymentMethodId = $paymentMethodId,
            categoryId = $categoryId,
            accountId = $accountId,
            createdAt = CASE
                WHEN $createdAt IS NULL THEN CURRENT_TIMESTAMP
                ELSE $createdAt
            END,
            syncState = CASE
                WHEN syncState = 'created' THEN 'created'
                ELSE 'updated'
            END
        WHERE id = $id AND syncState != 'deleted';
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
            $amount: expenseRecordDTO.amount,
            $location: expenseRecordDTO.location ?? null,
            $description: expenseRecordDTO.description,
            $paymentMethodId: expenseRecordDTO.paymentMethodId,
            $categoryId: expenseRecordDTO.categoryId,
            $accountId: expenseRecordDTO.accountId,
            $createdAt: expenseRecordDTO.createdAt ?? null,
        });
    });
};

export const deleteExpenseRecord = async (db: SQLiteDatabase, id: string) => {
    const stmt = await db.prepareAsync(`
        UPDATE expense_records SET syncState = 'deleted' WHERE id = $id
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
        });
    });
};

export const getExpenseRecordsWithSyncState = async (db: SQLiteDatabase, syncState: string): Promise<ExpenseRecord[]> => {
    return await db.getAllAsync(
        "SELECT * FROM expense_records WHERE syncState = $state",
        { $state: syncState }
    );
};

export const setExpenseRecordBatchSynced = async (db: SQLiteDatabase, ids: string[]) => {
    if (ids.length === 0) {
        return;
    }
    const stmt = await db.prepareAsync(`
        UPDATE expense_records SET syncState = 'synced' WHERE id IN (SELECT value FROM json_each($ids))
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $ids: JSON.stringify(ids),
        });
    });
};

export const deleteExpenseRecordBatch = async (db: SQLiteDatabase, ids: string[]) => {
    if (ids.length === 0) {
        return;
    }
    const stmt = await db.prepareAsync(`
        DELETE FROM expense_records WHERE id IN (SELECT value FROM json_each($ids))
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $ids: JSON.stringify(ids),
        });
    });
};

export const getAllLocalExpenseRecordIds = async (db: SQLiteDatabase): Promise<string[]> => {
    const result = await db.getAllAsync<{ id: string }>("SELECT id FROM expense_records");
    return result.map(row => row.id);
};

export const insertRemoteExpenseRecord = async (db: SQLiteDatabase, record: ExpenseRecordResponseDTO) => {
    let amount = Math.abs(record.amount);
    const cat = await db.getFirstAsync<{ type: string }>(
        "SELECT type FROM categories WHERE id = $id",
        { $id: record.categoryId }
    );
    if (cat && cat.type?.toLowerCase() === "expense") {
        amount = -amount;
    }

    const stmt = await db.prepareAsync(`
        INSERT INTO expense_records (id, amount, location, description, paymentMethodId, categoryId, accountId, createdAt, syncState) 
        VALUES ($id, $amount, $location, $description, $paymentMethodId, $categoryId, $accountId, $createdAt, 'synced')
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: record.id,
            $amount: amount,
            $location: record.location ?? null,
            $description: record.description,
            $paymentMethodId: record.paymentMethodId,
            $categoryId: record.categoryId,
            $accountId: record.accountId,
            $createdAt: record.date + ' ' + record.time,
        });
    });
};

export const updateRemoteExpenseRecord = async (db: SQLiteDatabase, record: ExpenseRecordResponseDTO) => {
    let amount = Math.abs(record.amount);
    const existing = await db.getFirstAsync<{ amount: number }>(
        "SELECT amount FROM expense_records WHERE id = $id",
        { $id: record.id }
    );
    if (existing) {
        if (existing.amount < 0) {
            amount = -amount;
        }
    } else {
        const cat = await db.getFirstAsync<{ type: string }>(
            "SELECT type FROM categories WHERE id = $id",
            { $id: record.categoryId }
        );
        if (cat && cat.type?.toLowerCase() === "expense") {
            amount = -amount;
        }
    }

    const stmt = await db.prepareAsync(`
        UPDATE expense_records SET 
            amount = $amount, 
            location = $location, 
            description = $description, 
            paymentMethodId = $paymentMethodId, 
            categoryId = $categoryId, 
            accountId = $accountId,
            createdAt = $createdAt,
            syncState = 'synced'
        WHERE id = $id AND syncState = 'synced'
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: record.id,
            $amount: amount,
            $location: record.location ?? null,
            $description: record.description,
            $paymentMethodId: record.paymentMethodId,
            $categoryId: record.categoryId,
            $accountId: record.accountId,
            $createdAt: record.date + ' ' + record.time,
        });
    });
};