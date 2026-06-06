import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./authContext";
import { useSQLiteContext } from "expo-sqlite";
import { syncCategories, syncAccounts, syncPaymentMethods, syncExpenseRecords } from "@/utils/sync";
import NetInfo from '@react-native-community/netinfo';

type SyncContextType = {
    triggerSync: () => Promise<void>;
};

const SyncContext = createContext<SyncContextType | null>(null);

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error("useSync must be used within a SyncProvider");
    }
    return context;
};

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
    const db = useSQLiteContext();
    const isInternetReachable = useRef(false);
    const { user } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    const syncData = async () => {
        if (!isInternetReachable.current || user === null || isSyncing) {
            return;
        }

        setIsSyncing(true);
        console.log("SYNCHRONIZING");

        try {
            await syncCategories(db);
        } catch (e) {
            console.error("Failed to sync categories:", e);
        }
        try {
            await syncAccounts(db);
        } catch (e) {
            console.error("Failed to sync accounts:", e);
        }
        try {
            await syncPaymentMethods(db);
        } catch (e) {
            console.error("Failed to sync payment methods:", e);
        }
        try {
            await syncExpenseRecords(db);
        } catch (e) {
            console.error("Failed to sync expense records:", e);
        }
        console.log("SYNCHRONIZED");
        setIsSyncing(false);
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            isInternetReachable.current = !!state.isInternetReachable;
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        syncData();
    }, [isInternetReachable.current, user]);

    return (
        <SyncContext.Provider value={{ triggerSync: syncData }}>
            {children}
        </SyncContext.Provider>
    );
}