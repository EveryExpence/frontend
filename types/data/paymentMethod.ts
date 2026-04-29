import { SyncState } from "./syncState";

export interface PaymentMethod {
    id: string;
    name: string;
    syncState: SyncState;
}

export interface PaymentMethodInputDTO {
    name: string;
}