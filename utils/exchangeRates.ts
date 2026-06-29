import { exchangeRatesEndpoint } from "@/constants/endpoints";
import { apiFetch } from "@/utils/apiFetch";
import EncryptedStorage from "react-native-encrypted-storage";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";

type CachedRates = {
    rates: Record<string, number>;
    base: string;
};

let cached: CachedRates | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const fallbackRates = (baseCurrency: string): Record<string, number> => ({
    [baseCurrency.toUpperCase()]: 1,
});

export const fetchExchangeRates = async (
    baseCurrency: string = "USD",
): Promise<Record<string, number>> => {
    const base = baseCurrency.toUpperCase();

    if (
        cached &&
        cached.base === base &&
        Date.now() - lastFetchTime < CACHE_TTL
    ) {
        return cached.rates;
    }

    try {
        const token = await EncryptedStorage.getItem(accessTokenKey);
        if (!token) return fallbackRates(base);

        const res = await apiFetch(exchangeRatesEndpoint(base));
        if (res.ok) {
            const data = await res.json();
            if (data.conversion_rates) {
                cached = { rates: data.conversion_rates, base };
                lastFetchTime = Date.now();
                return cached.rates;
            }
        }
    } catch (e) {
        console.error("Failed to fetch exchange rates", e);
    }

    return cached && cached.base === base
        ? cached.rates
        : fallbackRates(base);
};

export const convertAmount = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: Record<string, number>,
): number => {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    if (from === to) return amount;

    // Rates are expressed as: 1 baseCurrency = rates[X] units of X.
    // Therefore: amount in `from` -> base (amount / rates[from]) -> `to` (* rates[to]).
    const fromRate = rates[from];
    const toRate = rates[to];
    if (!fromRate || !toRate) return amount;
    return (amount / fromRate) * toRate;
};

// Kept for backwards compatibility with any callers that still convert to USD.
export const convertAmountToUSD = (
    amount: number,
    currency: string,
    rates: Record<string, number>,
): number => convertAmount(amount, currency, "USD", rates);
