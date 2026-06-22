import { SyncState } from "./syncState";

export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    syncState: SyncState;
}

export interface PaymentMethodInputDTO {
    name: string;
    icon: string;
}

export interface CreatePaymentMethodRequestDTO {
    name: string;
    icon: string;
}

export interface RenamePaymentMethodRequestDTO {
    newName: string;
    icon: string;
}

export interface PaymentMethodResponseDTO {
    id: string;
    name: string;
    icon: string;
}