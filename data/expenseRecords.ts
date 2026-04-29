import { ExpenseRecord, ExpenseRecordInputDTO } from "@/types/data/expenseRecord";
import { SQLiteDatabase } from "expo-sqlite"
import { nanoid } from 'nanoid'

export const createExpenseRecord = async (db: SQLiteDatabase, expenseRecordDTO: ExpenseRecordInputDTO) => {
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

    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: nanoid(),
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

export const getAllExpenseRecords = async (db: SQLiteDatabase): Promise<ExpenseRecord[]> => {
    return await db.getAllAsync<ExpenseRecord>("SELECT * FROM expense_records WHERE syncState != 'deleted'");
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