import { SyncState } from "./syncState";

export interface Account {
    id: string;
    name: string;
    currency: string;
    balance: number;
    syncState: SyncState;
}

export interface AccountInputDTO {
    name: string;
    currency: string;
    balance: number;
}

export interface AccountResponseDTO {
    id: string;
    name: string;
    currency: string;
    balance: number;
}