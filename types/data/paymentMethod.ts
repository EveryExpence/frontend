import { SyncState } from "./syncState";

export interface PaymentMethod {
    id: string;
    name: string;
    syncState: SyncState;
}

export interface PaymentMethodInputDTO {
    name: string;
}

export interface CreatePaymentMethodRequestDTO {
    name: string;
}

export interface RenamePaymentMethodRequestDTO {
    newName: string;
}

export interface PaymentMethodResponseDTO {
    id: string;
    name: string;
}