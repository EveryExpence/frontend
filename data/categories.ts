import { Category, CategoryInputDTO } from "@/types/data/category"
import { SQLiteDatabase } from "expo-sqlite"
import { nanoid } from 'nanoid'

export const createCategory = async (db: SQLiteDatabase, categoryDTO: CategoryInputDTO) => {
    const stmt = await db.prepareAsync(`
        INSERT INTO categories (id, name, syncState) VALUES ($id, $name, 'created');
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: nanoid(),
            $name: categoryDTO.name,
        });
    });
};

export const getAllCategories = async (db: SQLiteDatabase): Promise<Category[]> => {
    return await db.getAllAsync<Category>("SELECT * FROM categories");
};

export const updateCategory = async (db: SQLiteDatabase, id: string, categoryDTO: CategoryInputDTO) => {
    const stmt = await db.prepareAsync(`
        UPDATE categories SET
            name = $name,
            syncState = CASE
                WHEN syncState = 'created' THEN 'created'
                ELSE 'updated'
        WHERE id = $id AND syncState != 'deleted';
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
            $name: categoryDTO.name,
        });
    });
};

export const deleteCategory = async (db: SQLiteDatabase, id: string) => {
    const stmt = await db.prepareAsync(`
        DELETE FROM categories WHERE id = $id;
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: nanoid(),
        });
    });
};