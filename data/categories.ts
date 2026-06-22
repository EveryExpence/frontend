import { Category, CategoryInputDTO, CategoryResponseDTO } from "@/types/data/category"
import { SQLiteDatabase } from "expo-sqlite"
import { nanoid } from 'nanoid'

export const createCategory = async (db: SQLiteDatabase, categoryDTO: CategoryInputDTO) => {
    const stmt = await db.prepareAsync(`
        INSERT INTO categories (id, name, type, icon) VALUES ($id, $name, $type, $icon);
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: nanoid(),
            $name: categoryDTO.name,
            $type: categoryDTO.type,
            $icon: categoryDTO.icon,
        });
    });
};

export const getAllCategories = async (db: SQLiteDatabase): Promise<Category[]> => {
    return await db.getAllAsync<Category>("SELECT * FROM categories WHERE syncState != 'deleted'");
};

export const updateCategory = async (db: SQLiteDatabase, id: string, categoryDTO: CategoryInputDTO) => {
    const stmt = await db.prepareAsync(`
        UPDATE categories SET
            name = $name,
            type = $type,
            icon = $icon,
            syncState = CASE
                WHEN syncState = 'created' THEN 'created'
                ELSE 'updated'
            END
        WHERE id = $id AND syncState != 'deleted';
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
            $name: categoryDTO.name,
            $type: categoryDTO.type,
            $icon: categoryDTO.icon,
        });
    });
};

export const deleteCategory = async (db: SQLiteDatabase, id: string) => {
    const stmt = await db.prepareAsync(`
        UPDATE categories SET syncState = 'deleted' WHERE id = $id
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
        });
    });
};

export const getCategoriesWithSyncState = async (db: SQLiteDatabase, syncState: string): Promise<Category[]> => {
    return await db.getAllAsync(
        "SELECT * FROM categories WHERE syncState = $state",
        { $state: syncState }
    );
}

export const setCategoryBatchSynced = async (db: SQLiteDatabase, ids: string[]) => {
    if (ids.length === 0) {
        return;
    }
    const stmt = await db.prepareAsync(`
        UPDATE categories SET syncState = 'synced' WHERE id IN (SELECT value FROM json_each($ids))
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $ids: JSON.stringify(ids),
        });
    })
}

export const deleteCategoryBatch = async (db: SQLiteDatabase, ids: string[]) => {
    if (ids.length === 0) {
        return;
    }
    const stmt = await db.prepareAsync(`
        DELETE FROM categories WHERE id IN (SELECT value FROM json_each($ids))
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $ids: JSON.stringify(ids),
        });
    })
}

export const getAllLocalCategoryIds = async (db: SQLiteDatabase): Promise<string[]> => {
    const result = await db.getAllAsync<{ id: string }>("SELECT id FROM categories");
    return result.map(row => row.id);
};

export const insertRemoteCategory = async (db: SQLiteDatabase, category: CategoryResponseDTO) => {
    const stmt = await db.prepareAsync(`
        INSERT INTO categories (id, name, type, icon, syncState) 
        VALUES ($id, $name, $type, $icon, 'synced')
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: category.id,
            $name: category.name,
            $type: category.type,
            $icon: category.icon,
        });
    });
};

export const updateRemoteCategory = async (db: SQLiteDatabase, category: CategoryResponseDTO) => {
    const stmt = await db.prepareAsync(`
        UPDATE categories SET 
            name = $name, 
            type = $type, 
            icon = $icon,
            syncState = 'synced'
        WHERE id = $id AND syncState = 'synced'
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: category.id,
            $name: category.name,
            $type: category.type,
            $icon: category.icon,
        });
    });
};