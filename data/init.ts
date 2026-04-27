import { SQLiteDatabase } from "expo-sqlite";

export const migrateDatabase = async (db: SQLiteDatabase) => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS payment_methods (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL DEFAULT 'payment method',
            wasCreated INTEGER NOT NULL DEFAULT 1,
            wasEdited INTEGER NOT NULL DEFAULT 0,
            wasDeleted INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL DEFAULT 'category',
            type TEXT NOT NULL DEFAULT 'expense',
            wasCreated INTEGER NOT NULL DEFAULT 1,
            wasEdited INTEGER NOT NULL DEFAULT 0,
            wasDeleted INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL DEFAULT 'account',
            currency TEXT NOT NULL DEFAULT 'USD',
            balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
            wasCreated INTEGER NOT NULL DEFAULT 1,
            wasEdited INTEGER NOT NULL DEFAULT 0,
            wasDeleted INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS expense_records (
            id TEXT PRIMARY KEY NOT NULL,
            amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
            location TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            description TEXT NOT NULL DEFAULT '',
            payment_method_id TEXT NOT NULL,
            category_id TEXT NOT NULL,
            account_id TEXT NOT NULL,
            wasCreated INTEGER NOT NULL DEFAULT 1,
            wasEdited INTEGER NOT NULL DEFAULT 0,
            wasDeleted INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY(payment_method_id) REFERENCES payment_methods(id),
            FOREIGN KEY(category_id) REFERENCES categories(id),
            FOREIGN KEY(account_id) REFERENCES accounts(id)
        );

        CREATE TABLE IF NOT EXISTS attachments (
            expense_record_id TEXT NOT NULL,
            content BLOB NOT NULL,
            FOREIGN KEY(expense_record_id) REFERENCES expense_records(id)
        );
    `);
}