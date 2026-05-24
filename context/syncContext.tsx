import { createContext, useEffect, useRef } from "react";
import { useAuth } from "./authContext";

export interface ISyncContext {
    startDataSync: () => void,
}

const SyncContext = createContext({} as ISyncContext);

const syncInterval = 5 * 60 * 1000;

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
    const intervalRef = useRef<number | null>(null);
    const isEnabled = useRef(false);
    const isInternetReachable = useRef(false);
    const { user } = useAuth();

    const startDataSync = () => {
        isEnabled.current = true;
    };

    const syncData = async () => {
        // ...
    };

    useEffect(() => {
        if (!isInternetReachable.current || user === null || !isEnabled.current) {
            return;
        }

        intervalRef.current = setInterval(syncData, syncInterval);

        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
            }
        }
    }, [isInternetReachable.current, isEnabled.current, user]);

    return <SyncContext.Provider value={{ startDataSync }}>{children}</SyncContext.Provider>
}