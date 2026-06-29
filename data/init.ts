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
                icon TEXT NOT NULL DEFAULT 'cash',
                syncState TEXT NOT NULL DEFAULT 'created'
            );

            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL DEFAULT 'category',
                type TEXT NOT NULL DEFAULT 'expense',
                icon TEXT NOT NULL DEFAULT 'label-outline',
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

            INSERT OR IGNORE INTO payment_methods (id, name, icon, syncState) VALUES 
            ('pm_cash', 'Cash', 'cash', 'synced'),
            ('pm_credit_card', 'Credit Card', 'credit-card', 'synced'),
            ('pm_debit_card', 'Debit Card', 'credit-card-outline', 'synced'),
            ('pm_bank_transfer', 'Bank Transfer', 'bank-transfer', 'synced'),
            ('pm_check', 'Check', 'checkbook', 'synced');

            INSERT OR IGNORE INTO categories (id, name, type, icon, syncState) VALUES
            ('cat_food', 'Food', 'EXPENSE', 'food-fork-drink', 'synced'),
            ('cat_transport', 'Transport', 'EXPENSE', 'car', 'synced'),
            ('cat_housing', 'Housing', 'EXPENSE', 'home', 'synced'),
            ('cat_utilities', 'Utilities', 'EXPENSE', 'lightning-bolt', 'synced'),
            ('cat_shopping', 'Shopping', 'EXPENSE', 'cart', 'synced'),
            ('cat_entertainment', 'Entertainment', 'EXPENSE', 'gamepad-variant', 'synced'),
            ('cat_others_expense', 'Others', 'EXPENSE', 'dots-horizontal', 'synced'),
            ('cat_salary', 'Salary', 'INCOME', 'cash-multiple', 'synced'),
            ('cat_business', 'Business', 'INCOME', 'briefcase', 'synced'),
            ('cat_investment', 'Investment', 'INCOME', 'chart-line', 'synced'),
            ('cat_gifts', 'Gifts', 'INCOME', 'gift', 'synced'),
            ('cat_others_income', 'Others', 'INCOME', 'dots-horizontal', 'synced');
        `);

        const accounts = await db.getAllAsync<{id: string}>("SELECT id FROM accounts LIMIT 1");
        if (accounts.length === 0) {
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            await db.execAsync(`INSERT INTO accounts (id, name, currency, balance, syncState) VALUES ('${uuid}', 'Main Account', 'USD', 0, 'created');`);
        }
    } catch (error) {
        console.error("Database migration failed:", error);
        throw new Error(`Database migration failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
        await db.execAsync("ALTER TABLE payment_methods ADD COLUMN icon TEXT NOT NULL DEFAULT 'cash';");
    } catch (e) {}

    try {
        await db.execAsync("ALTER TABLE categories ADD COLUMN icon TEXT NOT NULL DEFAULT 'label-outline';");
    } catch (e) {}
}