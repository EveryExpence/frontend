import { PaymentMethod, PaymentMethodInputDTO, PaymentMethodResponseDTO } from "@/types/data/paymentMethod";
import { SQLiteDatabase } from "expo-sqlite"
import { nanoid } from 'nanoid'

export const createPaymentMethod = async (db: SQLiteDatabase, paymentMethodDTO: PaymentMethodInputDTO) => {
    const stmt = await db.prepareAsync(`
        INSERT INTO payment_methods (id, name, icon) VALUES ($id, $name, $icon);
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: nanoid(),
            $name: paymentMethodDTO.name,
            $icon: paymentMethodDTO.icon,
        });
    });
};

export const getAllPaymentMethods = async (db: SQLiteDatabase): Promise<PaymentMethod[]> => {
    return await db.getAllAsync<PaymentMethod>("SELECT * FROM payment_methods WHERE syncState != 'deleted'");
};

export const updatePaymentMethod = async (db: SQLiteDatabase, id: string, paymentMethodDTO: PaymentMethodInputDTO) => {
    const stmt = await db.prepareAsync(`
        UPDATE payment_methods SET
            name = $name,
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
            $name: paymentMethodDTO.name,
            $icon: paymentMethodDTO.icon,
        });
    });
};

export const deletePaymentMethod = async (db: SQLiteDatabase, id: string) => {
    const stmt = await db.prepareAsync(`
        UPDATE payment_methods SET syncState = 'deleted' WHERE id = $id
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
        });
    });
};

export const getPaymentMethodsWithSyncState = async (db: SQLiteDatabase, syncState: string): Promise<PaymentMethod[]> => {
    return await db.getAllAsync(
        "SELECT * FROM payment_methods WHERE syncState = $state",
        { $state: syncState }
    );
};

export const setPaymentMethodBatchSynced = async (db: SQLiteDatabase, ids: string[]) => {
    if (ids.length === 0) {
        return;
    }
    const stmt = await db.prepareAsync(`
        UPDATE payment_methods SET syncState = 'synced' WHERE id IN (SELECT value FROM json_each($ids))
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $ids: JSON.stringify(ids),
        });
    });
};

export const deletePaymentMethodBatch = async (db: SQLiteDatabase, ids: string[]) => {
    if (ids.length === 0) {
        return;
    }
    const stmt = await db.prepareAsync(`
        DELETE FROM payment_methods WHERE id IN (SELECT value FROM json_each($ids))
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $ids: JSON.stringify(ids),
        });
    });
};

export const getAllLocalPaymentMethodIds = async (db: SQLiteDatabase): Promise<string[]> => {
    const result = await db.getAllAsync<{ id: string }>("SELECT id FROM payment_methods");
    return result.map(row => row.id);
};

export const insertRemotePaymentMethod = async (db: SQLiteDatabase, paymentMethod: PaymentMethodResponseDTO) => {
    const stmt = await db.prepareAsync(`
        INSERT INTO payment_methods (id, name, icon, syncState)
        VALUES ($id, $name, $icon, 'synced')
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: paymentMethod.id,
            $name: paymentMethod.name,
            $icon: paymentMethod.icon ?? 'cash',
        });
    });
};

export const updateRemotePaymentMethod = async (db: SQLiteDatabase, paymentMethod: PaymentMethodResponseDTO) => {
    const stmt = await db.prepareAsync(`
        UPDATE payment_methods SET
            name = $name,
            icon = $icon,
            syncState = 'synced'
        WHERE id = $id AND syncState = 'synced'
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: paymentMethod.id,
            $name: paymentMethod.name,
            $icon: paymentMethod.icon ?? 'cash',
        });
    });
};