import { SyncState } from "./syncState";

type CategoryType = "expense" | "income" | "varies";
export const categoryTypes: CategoryType[] = ["expense", "income", "varies"];

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    syncState: SyncState;
}

export interface CategoryResponseDTO {
    id: string;
    name: string;
    type: CategoryType;
}

export interface CategoryInputDTO {
    name: string;
    type: CategoryType;
}