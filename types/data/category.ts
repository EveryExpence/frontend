import { SyncState } from "./syncState";

export interface Category {
    id: string;
    name: string;
    syncState: SyncState;
}

export interface CategoryInputDTO {
    name: string;
}