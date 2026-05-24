import { createCategoryEndpoint, deleteCategoryEndpoint, getCategoryEndpoint, updateCategoryEndpoint } from "@/constants/endpoints";
import { deleteCategoryBatch, getAllLocalCategoryIds, getCategoriesWithSyncState, insertRemoteCategory, setCategoryBatchSynced, updateRemoteCategory } from "@/data/categories";
import { SQLiteDatabase } from "expo-sqlite"
import { apiFetch } from "./apiFetch";
import { CategoryResponseDTO } from "@/types/data/category";

export const syncCategories = async (db: SQLiteDatabase) => {
    const synchedCategoriesIds = [];

    const updatedCategories = await getCategoriesWithSyncState(db, 'updated');
    for (const category of updatedCategories) {
        const response = await apiFetch(updateCategoryEndpoint(category.id), {
            method: "PUT",
            body: JSON.stringify({
                name: category.name,
                type: category.type,
            }),
        });
        if (response.ok) {
            synchedCategoriesIds.push(category.id);
        }
    }

    const createdCategories = await getCategoriesWithSyncState(db, 'created');
    for (const category of createdCategories) {
        const response = await apiFetch(createCategoryEndpoint, {
            method: "POST",
            body: JSON.stringify({
                id: category.id,
                name: category.name,
                type: category.type,
            }),
        });
        if (response.ok) {
            synchedCategoriesIds.push(category.id);
        }
    }

    await setCategoryBatchSynced(db, synchedCategoriesIds);

    const deletedCategoriesIds = [];
    const deletedCategories = await getCategoriesWithSyncState(db, 'deleted');
    for (const category of deletedCategories) {
        const response = await apiFetch(deleteCategoryEndpoint(category.id), {
            method: "DELETE",
        });
        if (response.ok) {
            deletedCategoriesIds.push(category.id);
        }
    }
    await deleteCategoryBatch(db, deletedCategoriesIds);

    const response = await apiFetch(getCategoryEndpoint);
    if (!response.ok) {
        throw "Failed to fetch categories";
    }
    const remoteCategories: CategoryResponseDTO[] = await response.json();
    const localIds = await getAllLocalCategoryIds(db);
    const remoteIds = remoteCategories.map(c => c.id);

    const idsToDeleteLocally = localIds.filter(id => !remoteIds.includes(id));
    if (idsToDeleteLocally.length > 0) {
        await deleteCategoryBatch(db, idsToDeleteLocally);
    }

    for (const remoteCategory of remoteCategories) {
        if (!localIds.includes(remoteCategory.id)) {
            await insertRemoteCategory(db, remoteCategory);
        } else {
            await updateRemoteCategory(db, remoteCategory);
        }
    }
}