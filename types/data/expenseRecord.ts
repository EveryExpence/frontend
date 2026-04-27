import { SyncState } from "./syncState";

export interface ExpenseRecord {
    id: string;
    amount: number;
    location?: string;
    description: string;
    paymentMethodId: string;
    categoryId: string;
    accountId: string;
    createdAt?: number;
    syncState: SyncState;
}

export interface ExpenseRecordInputDTO {
    amount: number;
    location?: string;
    description: string;
    paymentMethodId: string;
    categoryId: string;
    accountId: string;
    createdAt?: number;
}