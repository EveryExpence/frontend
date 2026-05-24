import { createContext, useEffect, useRef } from "react";
import { useAuth } from "./authContext";
import { useSQLiteContext } from "expo-sqlite";
import { syncCategories } from "@/utils/sync";

export interface ISyncContext {
    startDataSync: () => void,
}

const SyncContext = createContext({} as ISyncContext);

const syncInterval = 5 * 60 * 1000;

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
    const db = useSQLiteContext();
    const timeoutRef = useRef<number | null>(null);
    const isEnabled = useRef(false);
    const isInternetReachable = useRef(false);
    const { user } = useAuth();

    const startDataSync = () => {
        isEnabled.current = true;
    };

    const syncData = async () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        const syncRequests = [
            syncCategories(db),
        ];

        await Promise.allSettled(syncRequests);
        timeoutRef.current = setTimeout(syncData, syncInterval);
    };

    useEffect(() => {
        if (!isInternetReachable.current || user === null || !isEnabled.current) {
            return;
        }

        syncData();

        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [isInternetReachable.current, isEnabled.current, user]);

    return <SyncContext.Provider value={{ startDataSync }}>{children}</SyncContext.Provider>
}