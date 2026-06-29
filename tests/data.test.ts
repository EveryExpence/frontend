import { createAccount, deleteAccount, getAccountBalance, getAllAccounts, updateAccount } from "@/data/accounts";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "@/data/categories";
import { createExpenseRecord, deleteExpenseRecord, getAllExpenseRecords, updateExpenseRecord } from "@/data/expenseRecords";
import { migrateDatabase } from "@/data/init";
import { createPaymentMethod, deletePaymentMethod, getAllPaymentMethods, updatePaymentMethod } from "@/data/paymentMethods";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import { saveAttachments, getAttachmentsForExpense, deleteAttachmentsForExpense } from "@/data/attachments";

jest.mock('expo-file-system/legacy', () => ({
    readAsStringAsync: jest.fn().mockResolvedValue('AQID'),
    EncodingType: { Base64: 'base64' }
}));

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
        await createCategory(db, { name: "Transport", type: "expense", icon: "train" });
        await createCategory(db, { name: "Job", type: "income", icon: "briefcase" });
        await createCategory(db, { name: "Food", type: "expense", icon: "food" });

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
        const category = categories.find((category) => category.name === "Transport")!;
        await updateCategory(db, category.id, { name: "Gifts", type: "income", icon: "gift" });
        
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
        await createPaymentMethod(db, { name: "Card", icon: "credit-card" });
        await createPaymentMethod(db, { name: "Cash", icon: "cash" });
        await createPaymentMethod(db, { name: "BLIK", icon: "cellphone-nfc" });

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
        await updatePaymentMethod(db, paymentMethod!.id, { name: "Credit Card", icon: "credit-card" });
        
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
        expect(account1?.balance).toBeCloseTo(2359.29);
        const account2 = accounts.find((account) => account.name === "Dollar Account");
        expect(account2).not.toBeUndefined();
        expect(account2?.currency).toEqual("USD");
        expect(account2?.balance).toBeCloseTo(343.99);
        const account3 = accounts.find((account) => account.name === "Savings");
        expect(account3).not.toBeUndefined();
        expect(account3?.currency).toEqual("EUR");
        expect(account3?.balance).toBeCloseTo(1534.99);
    });

    test("account should be updated", async () => {
        let accounts = await getAllAccounts(db);
        const account = accounts.find((account) => account.name === "Dollar Account")!;
        await updateAccount(db, account.id, { ...account, name: "Crypto" });
        
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

    test("expense records should be added", async () => {
        const category = (await getAllCategories(db)).find((c) => c.name === "Job")!;
        const paymentMethod = (await getAllPaymentMethods(db)).find((p) => p.name === "Cash")!;
        let account1 = (await getAllAccounts(db)).find((a) => a.name === "Main")!;
        let account2 = (await getAllAccounts(db)).find((a) => a.name === "Savings")!;

        await createExpenseRecord(db, {
            amount: 3000.34,
            location: "latitude=22.321875;longtitude=114.161842",
            description: "Monthly salary",
            paymentMethodId: paymentMethod.id,
            categoryId: category.id,
            accountId: account1.id,
        });
        await createExpenseRecord(db, {
            amount: -104.45,
            description: "Groceries",
            paymentMethodId: paymentMethod.id,
            categoryId: category.id,
            accountId: account1.id,
        });
        await createExpenseRecord(db, {
            amount: 1000,
            description: "Gift from brother",
            paymentMethodId: paymentMethod.id,
            categoryId: category.id,
            accountId: account2.id,
            createdAt: new Date("December 17, 1995 03:24:00").getTime(),
        });

        const expenseRecords = await getAllExpenseRecords(db);
        expect(expenseRecords.length).toBe(3);

        const expenseRecord1 = expenseRecords.find((expenseRecord) => expenseRecord.description === "Monthly salary");
        expect(expenseRecord1).not.toBeUndefined();
        expect(expenseRecord1?.amount).toBeCloseTo(3000.34);
        expect(expenseRecord1?.location).toEqual("latitude=22.321875;longtitude=114.161842");
        expect(expenseRecord1?.paymentMethodId).toEqual(paymentMethod.id);
        expect(expenseRecord1?.categoryId).toEqual(category.id);
        expect(expenseRecord1?.accountId).toEqual(account1.id);
        const expenseRecord2 = expenseRecords.find((expenseRecord) => expenseRecord.description === "Groceries");
        expect(expenseRecord2).not.toBeUndefined();
        expect(expenseRecord2?.amount).toBeCloseTo(-104.45);
        expect(expenseRecord2?.location).toBeNull();
        expect(expenseRecord2?.paymentMethodId).toEqual(paymentMethod.id);
        expect(expenseRecord2?.categoryId).toEqual(category.id);
        expect(expenseRecord2?.accountId).toEqual(account1.id);
        const expenseRecord3 = expenseRecords.find((expenseRecord) => expenseRecord.description === "Gift from brother");
        expect(expenseRecord3).not.toBeUndefined();
        expect(expenseRecord3?.location).toBeNull();
        expect(expenseRecord3?.amount).toBeCloseTo(1000);
        expect(expenseRecord3?.paymentMethodId).toEqual(paymentMethod.id);
        expect(expenseRecord3?.categoryId).toEqual(category.id);
        expect(expenseRecord3?.accountId).toEqual(account2.id);
        expect(expenseRecord3?.createdAt).toEqual(new Date("December 17, 1995 03:24:00").getTime());

        account1 = (await getAllAccounts(db)).find((a) => a.name === "Main")!;
        const account1Balance = await getAccountBalance(db, account1.id);
        expect(account1Balance).toBeCloseTo(5255.18);
        account2 = (await getAllAccounts(db)).find((a) => a.name === "Savings")!;
        const account2Balance = await getAccountBalance(db, account2.id);
        expect(account2Balance).toBeCloseTo(2534.99);
    });

    test("expense record should be updated", async () => {
        let expenseRecords = await getAllExpenseRecords(db);
        const expenseRecord = expenseRecords.find((expenseRecord) => expenseRecord.description === "Groceries")!;
        await updateExpenseRecord(db, expenseRecord.id, { ...expenseRecord, amount: -100.45 });

        expenseRecords = await getAllExpenseRecords(db);
        const edited = expenseRecords.find((expenseRecord) => expenseRecord.description === "Groceries")!;
        expect(edited.amount).toBeCloseTo(-100.45);

        const accountBalance = await getAccountBalance(db, expenseRecord.accountId);
        expect(accountBalance).toBeCloseTo(5259.18);
    });

    test("expense record should be deleted", async () => {
        let expenseRecords = await getAllExpenseRecords(db);
        const expenseRecord = expenseRecords.find((expenseRecord) => expenseRecord.description === "Groceries")!;
        await deleteExpenseRecord(db, expenseRecord.id);
        
        expenseRecords = await getAllExpenseRecords(db);
        expect(expenseRecords.length).toBe(2);
        
        const descriptions = expenseRecords.map((expenseRecord) => expenseRecord.description);
        expect(descriptions).toContain("Monthly salary");
        expect(descriptions).toContain("Gift from brother");
        
        const accountBalance = await getAccountBalance(db, expenseRecord.accountId);
        expect(accountBalance).toBeCloseTo(5359.63);
    });

    test("attachments should be saved", async () => {
        const expenseRecords = await getAllExpenseRecords(db);
        const expenseRecord = expenseRecords.find((expenseRecord) => expenseRecord.description === "Monthly salary")!;
        
        await saveAttachments(db, expenseRecord.id, ["file://fake/path/image1.jpg"]);
        expect(true).toBe(true);
    });

    test("attachments should be retrieved and deleted", async () => {
        const expenseRecords = await getAllExpenseRecords(db);
        const expenseRecord = expenseRecords.find((expenseRecord) => expenseRecord.description === "Monthly salary")!;
        
        const attachments = await getAttachmentsForExpense(db, expenseRecord.id);
        expect(attachments.length).toBe(1);
        const contentArray = Array.from(attachments[0].content);
        expect(contentArray).toEqual([1, 2, 3]);
        
        await deleteAttachmentsForExpense(db, expenseRecord.id);
        const remainingAttachments = await getAttachmentsForExpense(db, expenseRecord.id);
        expect(remainingAttachments.length).toBe(0);
    });

    test("should add 10_000 expense records", async () => {
        const category = (await getAllCategories(db)).find((c) => c.name === "Job")!;
        const paymentMethod = (await getAllPaymentMethods(db)).find((p) => p.name === "Cash")!;
        const account = (await getAllAccounts(db)).find((a) => a.name === "Savings")!;
        for (let i = 0; i < 10_000; ++i) {
            await createExpenseRecord(db, {
                amount: 1,
                description: "Monthly salary",
                paymentMethodId: paymentMethod.id,
                categoryId: category.id,
                accountId: account.id,
            });
        }
    });

    test ("should calculate account balance", async () => {
        const account = (await getAllAccounts(db)).find((a) => a.name === "Savings")!;
        const accountBalance = await getAccountBalance(db, account.id);
        expect(accountBalance).toBeCloseTo(12534.99);
    });
})