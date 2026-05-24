import { createContext, useEffect, useRef } from "react";
import { useAuth } from "./authContext";
import { useSQLiteContext } from "expo-sqlite";
import { syncCategories } from "@/utils/sync";
import NetInfo from '@react-native-community/netinfo';

const SyncContext = createContext(null);

const syncInterval = 10 * 1000;

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
    const db = useSQLiteContext();
    const timeoutRef = useRef<number | null>(null);
    const isInternetReachable = useRef(false);
    const { user } = useAuth();

    const syncData = async () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        const syncRequests = [
            syncCategories(db),
        ];

        console.log("SYNCHRONIZING");
        await Promise.allSettled(syncRequests);
        console.log("SYNCHRONIZED");
        timeoutRef.current = setTimeout(syncData, syncInterval);
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            isInternetReachable.current = !!state.isInternetReachable;
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isInternetReachable.current || user === null) {
            return;
        }

        syncData();

        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [isInternetReachable.current, user]);

    return <SyncContext.Provider value={null}>{children}</SyncContext.Provider>
}