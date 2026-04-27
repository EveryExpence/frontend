import { SyncState } from "./syncState";

type CategoryType = "expense" | "income";

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    syncState: SyncState;
}

export interface CategoryInputDTO {
    name: string;
    type: CategoryType;
}