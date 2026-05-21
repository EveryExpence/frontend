import { SQLiteDatabase } from "expo-sqlite";

export const migrateDatabase = async (db: SQLiteDatabase) => {
    try {
        await db.execAsync("SELECT id FROM attachments LIMIT 1");
    } catch (e) {
        await db.execAsync("DROP TABLE IF EXISTS attachments;");
    }

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS payment_methods (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL DEFAULT 'payment method',
            syncState TEXT NOT NULL DEFAULT 'created'
        );

        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL DEFAULT 'category',
            type TEXT NOT NULL DEFAULT 'expense',
            syncState TEXT NOT NULL DEFAULT 'created'
        );

        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL DEFAULT 'account',
            currency TEXT NOT NULL DEFAULT 'USD',
            balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
            syncState TEXT NOT NULL DEFAULT 'created'
        );

        CREATE TABLE IF NOT EXISTS expense_records (
            id TEXT PRIMARY KEY NOT NULL,
            amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
            location TEXT,
            description TEXT NOT NULL DEFAULT '',
            createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            syncState TEXT NOT NULL DEFAULT 'created',
            paymentMethodId TEXT NOT NULL,
            categoryId TEXT NOT NULL,
            accountId TEXT NOT NULL,
            FOREIGN KEY(paymentMethodId) REFERENCES payment_methods(id),
            FOREIGN KEY(categoryId) REFERENCES categories(id),
            FOREIGN KEY(accountId) REFERENCES accounts(id)
        );

        CREATE TABLE IF NOT EXISTS attachments (
            id TEXT PRIMARY KEY NOT NULL,
            expense_record_id TEXT NOT NULL,
            content BLOB NOT NULL,
            FOREIGN KEY(expense_record_id) REFERENCES expense_records(id)
        );
    `);
}