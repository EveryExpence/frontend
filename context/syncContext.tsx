import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./authContext";
import { useSQLiteContext } from "expo-sqlite";
import {
  syncCategories,
  syncAccounts,
  syncPaymentMethods,
  syncExpenseRecords,
} from "@/utils/sync";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export type SyncResult =
  | { status: "success" }
  | { status: "offline" }
  | { status: "no_user" }
  | { status: "error"; message: string };

type SyncContextType = {
  triggerSync: () => Promise<SyncResult>;
  lastSyncError: string | null;
  isSyncing: boolean;
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

  const syncData = async (): Promise<SyncResult> => {
    if (!isInternetReachable.current) {
      return { status: "offline" };
    }
    if (user === null) {
      return { status: "no_user" };
    }
    if (isSyncing) {
      return { status: "success" };
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

    setIsSyncing(false);

    if (errors.length > 0) {
      const errorMsg = `Sync failed for: ${errors.join(", ")}`;
      setLastSyncError(errorMsg);
      return { status: "error", message: errorMsg };
    }

    return { status: "success" };
  };

  const triggerSync = async (): Promise<SyncResult> => {
    const result = await syncData();
    if (result.status === "success") {
      Toast.show({ text1: t("common.sync_success"), type: "success" });
    } else if (result.status === "offline") {
      Toast.show({ text1: t("common.sync_offline"), type: "error" });
    } else if (result.status === "error") {
      Toast.show({
        text1: t("common.sync_error"),
        text2: result.message,
        type: "error",
      });
    }
    return result;
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      isInternetReachable.current = !!state.isInternetReachable;
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    syncData();
  }, [isInternetReachable.current, user]);

  return (
    <SyncContext.Provider value={{ triggerSync, lastSyncError, isSyncing }}>
      {children}
    </SyncContext.Provider>
  );
};
