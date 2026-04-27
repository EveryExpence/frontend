import { PaymentMethod, PaymentMethodInputDTO } from "@/types/data/paymentMethod";
import { SQLiteDatabase } from "expo-sqlite"
import { nanoid } from 'nanoid'

export const createPaymentMethod = async (db: SQLiteDatabase, paymentMethodDTO: PaymentMethodInputDTO) => {
    const stmt = await db.prepareAsync(`
        INSERT INTO payment_methods (id, name) VALUES ($id, $name);
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: nanoid(),
            $name: paymentMethodDTO.name,
        });
    });
};

export const getAllPaymentMethods = async (db: SQLiteDatabase): Promise<PaymentMethod[]> => {
    return await db.getAllAsync<PaymentMethod>("SELECT * FROM payment_methods");
};

export const updatePaymentMethod = async (db: SQLiteDatabase, id: string, paymentMethodDTO: PaymentMethodInputDTO) => {
    const stmt = await db.prepareAsync(`
        UPDATE payment_methods SET
            name = $name,
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
        });
    });
};

export const deletePaymentMethod = async (db: SQLiteDatabase, id: string) => {
    const stmt = await db.prepareAsync(`
        DELETE FROM payment_methods WHERE id = $id;
    `);
    await db.withExclusiveTransactionAsync(async () => {
        await stmt.executeAsync({
            $id: id,
        });
    });
};