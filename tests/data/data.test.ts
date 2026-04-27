import { migrateDatabase } from "@/data/init";
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
})