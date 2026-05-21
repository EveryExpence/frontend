import { SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from 'expo-file-system/legacy';
import { nanoid } from 'nanoid';

export const saveAttachments = async (db: SQLiteDatabase, expenseRecordId: string, imageUris: string[]) => {
    const stmt = await db.prepareAsync(`
        INSERT INTO attachments (
            id,
            expense_record_id,
            content
        ) VALUES (
            $id,
            $expense_record_id,
            $content
        );
    `);

    await db.withExclusiveTransactionAsync(async () => {
        for (const uri of imageUris) {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            await stmt.executeAsync({
                $id: nanoid(),
                $expense_record_id: expenseRecordId,
                $content: bytes,
            });
        }
    });
};

export const getAttachmentsForExpense = async (db: SQLiteDatabase, expenseRecordId: string): Promise<{ id: string, content: Uint8Array }[]> => {
    return await db.getAllAsync<{ id: string, content: Uint8Array }>(
        "SELECT id, content FROM attachments WHERE expense_record_id = ?",
        [expenseRecordId]
    );
};

export const deleteAttachmentsForExpense = async (db: SQLiteDatabase, expenseRecordId: string) => {
    const stmt = await db.prepareAsync(`
        DELETE FROM attachments WHERE expense_record_id = $expense_record_id
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $expense_record_id: expenseRecordId,
        });
    });
};
