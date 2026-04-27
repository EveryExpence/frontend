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
        await createCategory(db, { name: "IT" });
        await createCategory(db, { name: "Marketing" });
        await createCategory(db, { name: "Support" });

        const categories = await getAllCategories(db);
        expect(categories.length).toBe(3);

        const names = categories.map((category: Category) => category.name);
        expect(names).toContain("IT");
        expect(names).toContain("Marketing");
        expect(names).toContain("Support");
    });

    test("category should be updated", async () => {
        let categories = await getAllCategories(db);
        const id = categories.find((category: Category) => category.name === "IT")!.id;
        await updateCategory(db, id, { name: "EDITED" });
        
        categories = await getAllCategories(db);
        const editedCategory = categories.find((category: Category) => category.name === "EDITED");
        expect(editedCategory).not.toBeUndefined();
    })

    test("category should be deleted", async () => {
        let categories = await getAllCategories(db);
        const id = categories.find((category: Category) => category.name === "EDITED")!.id;
        await deleteCategory(db, id);

        categories = await getAllCategories(db);
        expect(categories.length).toBe(2);

        const names = categories.map((category: Category) => category.name);
        expect(names).toContain("Marketing");
        expect(names).toContain("Support");
    })
})