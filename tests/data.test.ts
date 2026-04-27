import { createCategory, deleteCategory, getAllCategories, updateCategory } from "@/data/categories";
import { migrateDatabase } from "@/data/init";
import { Category } from "@/types/data/category";
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

        const transport = categories.find((category) => category.name === "Transport");
        expect(transport).not.toBeUndefined();
        expect(transport?.type).toEqual("expense");
        const job = categories.find((category) => category.name === "Job");
        expect(job).not.toBeUndefined();
        expect(job?.type).toEqual("income");
        const food = categories.find((category) => category.name === "Food");
        expect(food).not.toBeUndefined();
        expect(food?.type).toEqual("expense");
    });

    test("category should be updated", async () => {
        let categories = await getAllCategories(db);
        const category = categories.find((category: Category) => category.name === "Transport");
        expect(category).not.toBeUndefined();
        await updateCategory(db, category!.id, { name: "Gifts", type: "income" });
        
        categories = await getAllCategories(db);
        const editedCategory = categories.find((category: Category) => category.name === "Gifts");
        expect(editedCategory).not.toBeUndefined();
        expect(editedCategory?.type).toEqual("income");
    });

    test("category should be deleted", async () => {
        let categories = await getAllCategories(db);
        const id = categories.find((category: Category) => category.name === "Gifts")!.id;
        await deleteCategory(db, id);

        categories = await getAllCategories(db);
        expect(categories.length).toBe(2);

        const names = categories.map((category: Category) => category.name);
        expect(names).toContain("Job");
        expect(names).toContain("Food");
    });
})