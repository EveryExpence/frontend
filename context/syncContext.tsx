import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./authContext";
import { useSQLiteContext } from "expo-sqlite";
import { syncCategories, syncAccounts, syncPaymentMethods, syncExpenseRecords } from "@/utils/sync";
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

type SyncContextType = {
    triggerSync: () => Promise<void>;
    lastSyncError: string | null;
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
    const [lastSyncError, setLastSyncError] = useState<string | null>(null);
    const { t } = useTranslation();

    const syncData = async () => {
        if (!isInternetReachable.current || user === null || isSyncing) {
            return;
        }

        setIsSyncing(true);
        setLastSyncError(null);
        const errors: string[] = [];

        try {
            await syncCategories(db);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            console.error("Failed to sync categories:", msg);
            errors.push("categories");
        }
        try {
            await syncAccounts(db);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            console.error("Failed to sync accounts:", msg);
            errors.push("accounts");
        }
        try {
            await syncPaymentMethods(db);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            console.error("Failed to sync payment methods:", msg);
            errors.push("payment methods");
        }
        try {
            await syncExpenseRecords(db);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            console.error("Failed to sync expense records:", msg);
            errors.push("expense records");
        }

        if (errors.length > 0) {
            const errorMsg = `Sync failed for: ${errors.join(", ")}`;
            setLastSyncError(errorMsg);
            Toast.show({ text1: t('common.sync_error'), text2: errorMsg, type: 'error' });
        }

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
        <SyncContext.Provider value={{ triggerSync: syncData, lastSyncError }}>
            {children}
        </SyncContext.Provider>
    );
}