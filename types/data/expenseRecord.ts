import { SyncState } from "./syncState";

export interface ExpenseRecord {
    id: string;
    ammount: number;
    location: string | null;
    description: string;
    paymentMethodId: string;
    categoryId: string;
    accountId: string;
    createdAt: Date;
    syncState: SyncState;
}

export interface ExpenseRecordInputDTO {
    ammount: number;
    location: string | null;
    description: string;
    createdAt: Date | null;
    paymentMethodId: string;
    categoryId: string;
    accountId: string;
}