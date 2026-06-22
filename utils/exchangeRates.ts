import { exchangeRatesEndpoint } from "@/constants/endpoints";
import { apiFetch } from "@/utils/apiFetch";

let cachedRates: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const fetchExchangeRates = async (baseCurrency: string = "USD"): Promise<Record<string, number>> => {
    if (cachedRates && Date.now() - lastFetchTime < CACHE_TTL) {
        return cachedRates;
    }

    try {
        const res = await apiFetch(exchangeRatesEndpoint(baseCurrency));
        if (res.ok) {
            const data = await res.json();
            if (data.conversion_rates) {
                cachedRates = data.conversion_rates;
                lastFetchTime = Date.now();
                return cachedRates!;
            }
        }
    } catch (e) {
        console.error("Failed to fetch exchange rates", e);
    }
    
    // Fallback if API fails
    return cachedRates || { "USD": 1 };
};

export const convertAmountToUSD = (amount: number, currency: string, rates: Record<string, number>): number => {
    if (currency === "USD") return amount;
    const rate = rates[currency];
    if (!rate) return amount; // Unlikely fallback
    
    // Convert to USD: amount / rate
    return amount / rate;
};
