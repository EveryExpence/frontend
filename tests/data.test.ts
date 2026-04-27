import { createAccount, deleteAccount, getAllAccounts, updateAccount } from "@/data/accounts";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "@/data/categories";
import { migrateDatabase } from "@/data/init";
import { createPaymentMethod, deletePaymentMethod, getAllPaymentMethods, updatePaymentMethod } from "@/data/paymentMethods";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";

describe("data module", () => {
    let db: SQLiteDatabase

    test("db should open", async () => {
        db = await openDatabaseAsync(
            'test_db',
        );
        expect(db).not.toBeNull();
    });

    test("migration should apply", async () => {
        migrateDatabase(db);
    });

    test("categories should be added", async () => {
        await createCategory(db, { name: "Transport", type: "expense" });
        await createCategory(db, { name: "Job", type: "income" });
        await createCategory(db, { name: "Food", type: "expense" });

        const categories = await getAllCategories(db);
        expect(categories.length).toBe(3);

        const category1 = categories.find((category) => category.name === "Transport");
        expect(category1).not.toBeUndefined();
        expect(category1?.type).toEqual("expense");
        const category2 = categories.find((category) => category.name === "Job");
        expect(category2).not.toBeUndefined();
        expect(category2?.type).toEqual("income");
        const category3 = categories.find((category) => category.name === "Food");
        expect(category3).not.toBeUndefined();
        expect(category3?.type).toEqual("expense");
    });

    test("category should be updated", async () => {
        let categories = await getAllCategories(db);
        const category = categories.find((category) => category.name === "Transport");
        expect(category).not.toBeUndefined();
        await updateCategory(db, category!.id, { name: "Gifts", type: "income" });
        
        categories = await getAllCategories(db);
        const edited = categories.find((category) => category.name === "Gifts");
        expect(edited).not.toBeUndefined();
        expect(edited?.type).toEqual("income");
    });

    test("category should be deleted", async () => {
        let categories = await getAllCategories(db);
        const id = categories.find((category) => category.name === "Gifts")!.id;
        await deleteCategory(db, id);

        categories = await getAllCategories(db);
        expect(categories.length).toBe(2);

        const names = categories.map((category) => category.name);
        expect(names).toContain("Job");
        expect(names).toContain("Food");
    });

    test("payment methods should be added", async () => {
        await createPaymentMethod(db, { name: "Card" });
        await createPaymentMethod(db, { name: "Cash" });
        await createPaymentMethod(db, { name: "BLIK" });

        const paymentMethods = await getAllPaymentMethods(db);
        expect(paymentMethods.length).toBe(3);

        const names = paymentMethods.map((paymentMethod) => paymentMethod.name);
        expect(names).toContain("Card");
        expect(names).toContain("Cash");
        expect(names).toContain("BLIK");
    });

    test("payment method should be updated", async () => {
        let paymentMethods = await getAllPaymentMethods(db);
        const paymentMethod = paymentMethods.find((paymentMethod) => paymentMethod.name === "Card");
        expect(paymentMethod).not.toBeUndefined();
        await updatePaymentMethod(db, paymentMethod!.id, { name: "Credit Card" });
        
        paymentMethods = await getAllPaymentMethods(db);
        const edited = paymentMethods.find((paymentMethod) => paymentMethod.name === "Credit Card");
        expect(edited).not.toBeUndefined();
    });

    test("payment method should be deleted", async () => {
        let paymentMethods = await getAllPaymentMethods(db);
        const id = paymentMethods.find((paymentMethod) => paymentMethod.name === "Credit Card")!.id;
        await deletePaymentMethod(db, id);

        paymentMethods = await getAllPaymentMethods(db);
        expect(paymentMethods.length).toBe(2);

        const names = paymentMethods.map((paymentMethod) => paymentMethod.name);
        expect(names).toContain("Cash");
        expect(names).toContain("BLIK");
    });

    test("accounts should be added", async () => {
        await createAccount(db, { name: "Main", currency: "PLN", balance: 2359.29 });
        await createAccount(db, { name: "Dollar Account", currency: "USD", balance: 343.99 });
        await createAccount(db, { name: "Savings", currency: "EUR", balance: 1534.99 });

        const accounts = await getAllAccounts(db);
        expect(accounts.length).toBe(3);

        const account1 = accounts.find((account) => account.name === "Main");
        expect(account1).not.toBeUndefined();
        expect(account1?.currency).toEqual("PLN");
        expect(account1?.balance).toEqual(2359.29);
        const account2 = accounts.find((account) => account.name === "Dollar Account");
        expect(account2).not.toBeUndefined();
        expect(account2?.currency).toEqual("USD");
        expect(account2?.balance).toEqual(343.99);
        const account3 = accounts.find((account) => account.name === "Savings");
        expect(account3).not.toBeUndefined();
        expect(account3?.currency).toEqual("EUR");
        expect(account3?.balance).toEqual(1534.99);
    });

    test("account should be updated", async () => {
        let accounts = await getAllAccounts(db);
        const account = accounts.find((account) => account.name === "Dollar Account");
        expect(account).not.toBeUndefined();
        await updateAccount(db, account!.id, { ...account!, name: "Crypto" });
        
        accounts = await getAllAccounts(db);
        const edited = accounts.find((account) => account.name === "Crypto");
        expect(edited).not.toBeUndefined();
    });

    test("account should be deleted", async () => {
        let accounts = await getAllAccounts(db);
        const id = accounts.find((account) => account.name === "Crypto")!.id;
        await deleteAccount(db, id);

        accounts = await getAllAccounts(db);
        expect(accounts.length).toBe(2);

        const names = accounts.map((account) => account.name);
        expect(names).toContain("Main");
        expect(names).toContain("Savings");
    });
})