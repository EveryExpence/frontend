import { 
    createCategoryEndpoint, deleteCategoryEndpoint, getCategoryEndpoint, updateCategoryEndpoint,
    createAccountEndpoint, deleteAccountEndpoint, getAccountsEndpoint, updateAccountEndpoint,
    createPaymentMethodEndpoint, deletePaymentMethodEndpoint, getPaymentMethodsEndpoint, updatePaymentMethodEndpoint,
    createExpenseRecordEndpoint, deleteExpenseRecordEndpoint, getExpenseRecordsEndpoint, updateExpenseRecordEndpoint
} from "@/constants/endpoints";
import { deleteCategoryBatch, getAllLocalCategoryIds, getCategoriesWithSyncState, insertRemoteCategory, setCategoryBatchSynced, updateRemoteCategory } from "@/data/categories";
import { deleteAccountBatch, getAllLocalAccountIds, getAccountsWithSyncState, insertRemoteAccount, setAccountBatchSynced, updateRemoteAccount } from "@/data/accounts";
import { deletePaymentMethodBatch, getAllLocalPaymentMethodIds, getPaymentMethodsWithSyncState, insertRemotePaymentMethod, setPaymentMethodBatchSynced, updateRemotePaymentMethod } from "@/data/paymentMethods";
import { deleteExpenseRecordBatch, getAllLocalExpenseRecordIds, getExpenseRecordsWithSyncState, insertRemoteExpenseRecord, setExpenseRecordBatchSynced, updateRemoteExpenseRecord } from "@/data/expenseRecords";
import { SQLiteDatabase } from "expo-sqlite"
import { apiFetch } from "./apiFetch";
import { CategoryResponseDTO } from "@/types/data/category";
import { AccountResponseDTO } from "@/types/data/account";
import { PaymentMethodResponseDTO } from "@/types/data/paymentMethod";
import { ExpenseRecordResponseDTO } from "@/types/data/expenseRecord";

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
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) { synchedCategoriesIds.push(category.id); }
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
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) { synchedCategoriesIds.push(category.id); }
    }

    await setCategoryBatchSynced(db, synchedCategoriesIds);

    const deletedCategoriesIds = [];
    const deletedCategories = await getCategoriesWithSyncState(db, 'deleted');
    for (const category of deletedCategories) {
        const response = await apiFetch(deleteCategoryEndpoint(category.id), { method: "DELETE" });
        if (response.ok) { deletedCategoriesIds.push(category.id); }
    }
    await deleteCategoryBatch(db, deletedCategoriesIds);

    const response = await apiFetch(getCategoryEndpoint);
    if (!response.ok) { console.error("FAILED TO FETCH CATEGORIES"); return; }
    const remoteCategories: CategoryResponseDTO[] = await response.json();
    const localIds = await getAllLocalCategoryIds(db);
    const remoteIds = remoteCategories.map(c => c.id);

    const idsToDeleteLocally = localIds.filter(id => !remoteIds.includes(id));
    if (idsToDeleteLocally.length > 0) { await deleteCategoryBatch(db, idsToDeleteLocally); }

    for (const remoteCategory of remoteCategories) {
        if (!localIds.includes(remoteCategory.id)) { await insertRemoteCategory(db, remoteCategory); }
        else { await updateRemoteCategory(db, remoteCategory); }
    }
}

export const syncAccounts = async (db: SQLiteDatabase) => {
    const synchedIds = [];
    const updated = await getAccountsWithSyncState(db, 'updated');
    for (const item of updated) {
        const response = await apiFetch(updateAccountEndpoint(item.id), {
            method: "PUT",
            body: JSON.stringify({ name: item.name, currency: item.currency, balance: item.balance }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) synchedIds.push(item.id);
    }

    const created = await getAccountsWithSyncState(db, 'created');
    for (const item of created) {
        const response = await apiFetch(createAccountEndpoint, {
            method: "POST",
            body: JSON.stringify({ id: item.id, name: item.name, currency: item.currency, balance: item.balance }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) synchedIds.push(item.id);
    }

    await setAccountBatchSynced(db, synchedIds);

    const deletedIds = [];
    const deleted = await getAccountsWithSyncState(db, 'deleted');
    for (const item of deleted) {
        const response = await apiFetch(deleteAccountEndpoint(item.id), { method: "DELETE" });
        if (response.ok) deletedIds.push(item.id);
    }
    await deleteAccountBatch(db, deletedIds);

    const response = await apiFetch(getAccountsEndpoint);
    if (!response.ok) { console.error("FAILED TO FETCH ACCOUNTS"); return; }
    const remote: AccountResponseDTO[] = await response.json();
    const localIds = await getAllLocalAccountIds(db);
    const remoteIds = remote.map(c => c.id);

    const idsToDeleteLocally = localIds.filter(id => !remoteIds.includes(id));
    if (idsToDeleteLocally.length > 0) await deleteAccountBatch(db, idsToDeleteLocally);

    for (const remoteItem of remote) {
        if (!localIds.includes(remoteItem.id)) await insertRemoteAccount(db, remoteItem);
        else await updateRemoteAccount(db, remoteItem);
    }
}

export const syncPaymentMethods = async (db: SQLiteDatabase) => {
    const synchedIds = [];
    const updated = await getPaymentMethodsWithSyncState(db, 'updated');
    for (const item of updated) {
        const response = await apiFetch(updatePaymentMethodEndpoint(item.id), {
            method: "PUT",
            body: JSON.stringify({ name: item.name }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) synchedIds.push(item.id);
    }

    const created = await getPaymentMethodsWithSyncState(db, 'created');
    for (const item of created) {
        const response = await apiFetch(createPaymentMethodEndpoint, {
            method: "POST",
            body: JSON.stringify({ id: item.id, name: item.name }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) synchedIds.push(item.id);
    }

    await setPaymentMethodBatchSynced(db, synchedIds);

    const deletedIds = [];
    const deleted = await getPaymentMethodsWithSyncState(db, 'deleted');
    for (const item of deleted) {
        const response = await apiFetch(deletePaymentMethodEndpoint(item.id), { method: "DELETE" });
        if (response.ok) deletedIds.push(item.id);
    }
    await deletePaymentMethodBatch(db, deletedIds);

    const response = await apiFetch(getPaymentMethodsEndpoint);
    if (!response.ok) { console.error("FAILED TO FETCH PAYMENT METHODS"); return; }
    const remote: PaymentMethodResponseDTO[] = await response.json();
    const localIds = await getAllLocalPaymentMethodIds(db);
    const remoteIds = remote.map(c => c.id);

    const idsToDeleteLocally = localIds.filter(id => !remoteIds.includes(id));
    if (idsToDeleteLocally.length > 0) await deletePaymentMethodBatch(db, idsToDeleteLocally);

    for (const remoteItem of remote) {
        if (!localIds.includes(remoteItem.id)) await insertRemotePaymentMethod(db, remoteItem);
        else await updateRemotePaymentMethod(db, remoteItem);
    }
}

export const syncExpenseRecords = async (db: SQLiteDatabase) => {
    const formatDateTime = (val: any) => {
        let dateStr = "2024-01-01";
        let timeStr = "00:00:00";
        if (val) {
            try {
                let d;
                if (typeof val === 'string') d = new Date(val.replace(' ', 'T'));
                else d = new Date(val);
                dateStr = d.toISOString().split('T')[0];
                timeStr = d.toISOString().split('T')[1].split('.')[0];
            } catch (e) {}
        }
        return { dateStr, timeStr };
    };

    const synchedIds = [];
    const updated = await getExpenseRecordsWithSyncState(db, 'updated');
    for (const item of updated) {
        const { dateStr, timeStr } = formatDateTime(item.createdAt);
        const response = await apiFetch(updateExpenseRecordEndpoint(item.id), {
            method: "PUT",
            body: JSON.stringify({ 
                amount: Math.abs(item.amount),
                date: dateStr,
                time: timeStr,
                location: item.location,
                accountId: item.accountId,
                paymentMethodId: item.paymentMethodId,
                categoryId: item.categoryId,
                description: item.description,
                attachments: [],
            }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) synchedIds.push(item.id);
    }

    const created = await getExpenseRecordsWithSyncState(db, 'created');
    for (const item of created) {
        const { dateStr, timeStr } = formatDateTime(item.createdAt);
        const response = await apiFetch(createExpenseRecordEndpoint, {
            method: "POST",
            body: JSON.stringify({ 
                id: item.id,
                amount: Math.abs(item.amount),
                date: dateStr,
                time: timeStr,
                location: item.location,
                accountId: item.accountId,
                paymentMethodId: item.paymentMethodId,
                categoryId: item.categoryId,
                description: item.description,
                attachments: [],
            }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) synchedIds.push(item.id);
    }

    await setExpenseRecordBatchSynced(db, synchedIds);

    const deletedIds = [];
    const deleted = await getExpenseRecordsWithSyncState(db, 'deleted');
    for (const item of deleted) {
        const response = await apiFetch(deleteExpenseRecordEndpoint(item.id), { method: "DELETE" });
        if (response.ok) deletedIds.push(item.id);
    }
    await deleteExpenseRecordBatch(db, deletedIds);

    const response = await apiFetch(getExpenseRecordsEndpoint);
    if (!response.ok) { console.error("FAILED TO FETCH EXPENSE RECORDS"); return; }
    const remote: ExpenseRecordResponseDTO[] = await response.json();
    const localIds = await getAllLocalExpenseRecordIds(db);
    const remoteIds = remote.map(c => c.id);

    const idsToDeleteLocally = localIds.filter(id => !remoteIds.includes(id));
    if (idsToDeleteLocally.length > 0) await deleteExpenseRecordBatch(db, idsToDeleteLocally);

    for (const remoteItem of remote) {
        if (!localIds.includes(remoteItem.id)) await insertRemoteExpenseRecord(db, remoteItem);
        else await updateRemoteExpenseRecord(db, remoteItem);
    }
}