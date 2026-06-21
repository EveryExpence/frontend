import { SQLiteDatabase } from "expo-sqlite";

export const migrateDatabase = async (db: SQLiteDatabase) => {
    try {
        await db.execAsync("SELECT id FROM attachments LIMIT 1");
    } catch (e) {
        await db.execAsync("DROP TABLE IF EXISTS attachments;");
    }

    try {
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

            INSERT OR IGNORE INTO payment_methods (id, name, syncState) VALUES 
            ('pm_cash', 'Cash', 'synced'),
            ('pm_credit_card', 'Credit Card', 'synced'),
            ('pm_debit_card', 'Debit Card', 'synced'),
            ('pm_bank_transfer', 'Bank Transfer', 'synced'),
            ('pm_check', 'Check', 'synced');

            INSERT OR IGNORE INTO categories (id, name, type, syncState) VALUES
            ('cat_food', 'Food', 'EXPENSE', 'synced'),
            ('cat_transport', 'Transport', 'EXPENSE', 'synced'),
            ('cat_housing', 'Housing', 'EXPENSE', 'synced'),
            ('cat_utilities', 'Utilities', 'EXPENSE', 'synced'),
            ('cat_shopping', 'Shopping', 'EXPENSE', 'synced'),
            ('cat_entertainment', 'Entertainment', 'EXPENSE', 'synced'),
            ('cat_others_expense', 'Others', 'EXPENSE', 'synced'),
            ('cat_salary', 'Salary', 'INCOME', 'synced'),
            ('cat_business', 'Business', 'INCOME', 'synced'),
            ('cat_investment', 'Investment', 'INCOME', 'synced'),
            ('cat_gifts', 'Gifts', 'INCOME', 'synced'),
            ('cat_others_income', 'Others', 'INCOME', 'synced');
        `);
    } catch (error) {
        console.error("Database migration failed:", error);
        throw new Error(`Database migration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}