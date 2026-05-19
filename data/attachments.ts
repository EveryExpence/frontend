import { SQLiteDatabase } from "expo-sqlite";

export const saveAttachments = async (db: SQLiteDatabase, expenseRecordId: string, imageUris: string[]) => {
    throw new Error("Not implemented");
};

export const getAttachmentsForExpense = async (db: SQLiteDatabase, expenseRecordId: string): Promise<{ id: string, content: Uint8Array }[]> => {
    throw new Error("Not implemented");
};

export const deleteAttachmentsForExpense = async (db: SQLiteDatabase, expenseRecordId: string) => {
    throw new Error("Not implemented");
};
