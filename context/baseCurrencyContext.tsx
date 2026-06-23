import EncryptedStorage from "react-native-encrypted-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { baseCurrencyKey } from "@/constants/encryptedStorageKeys";

type BaseCurrencyContextValue = {
    baseCurrency: string;
    isHydrated: boolean;
    setBaseCurrency: (code: string) => Promise<void>;
};

const DEFAULT_BASE_CURRENCY = "PLN";

const BaseCurrencyContext = createContext<BaseCurrencyContextValue>({
    baseCurrency: DEFAULT_BASE_CURRENCY,
    isHydrated: false,
    setBaseCurrency: async () => undefined,
});

export const BaseCurrencyProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [baseCurrency, setBaseCurrencyState] =
        useState<string>(DEFAULT_BASE_CURRENCY);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await EncryptedStorage.getItem(baseCurrencyKey);
                if (stored) {
                    setBaseCurrencyState(stored.toUpperCase());
                }
            } catch (error) {
                console.error("Failed to load base currency preference", error);
            } finally {
                setIsHydrated(true);
            }
        };
        load();
    }, []);

    const setBaseCurrency = useCallback(async (code: string) => {
        const normalized = code.toUpperCase();
        setBaseCurrencyState(normalized);
        try {
            await EncryptedStorage.setItem(baseCurrencyKey, normalized);
        } catch (error) {
            console.warn("Failed to save base currency preference:", error);
        }
    }, []);

    const value = useMemo(
        () => ({ baseCurrency, isHydrated, setBaseCurrency }),
        [baseCurrency, isHydrated, setBaseCurrency],
    );

    return (
        <BaseCurrencyContext.Provider value={value}>
            {children}
        </BaseCurrencyContext.Provider>
    );
};

export const useBaseCurrency = () => useContext(BaseCurrencyContext);
