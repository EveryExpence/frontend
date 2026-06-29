import { getCurrencyInfo } from "@/constants/currencies";

export const formatCurrency = (value: number, currency: string) => {
    const currencyInfo = getCurrencyInfo(currency);
    try {
        const formatted = new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currencyInfo.code,
            currencyDisplay: "narrowSymbol",
            maximumFractionDigits: 2,
        }).format(value);
        return formatted;
    } catch {
        return `${currencyInfo.symbol}${value.toFixed(2)}`;
    }
};