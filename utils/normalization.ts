export const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export const normalizeDate = (date: Date | string | number, locale: string = "en-US"): string => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsedDate);
};

export const formatCurrencyISO4217 = (value: number, currencyCode: string, locale: string = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "code",
  }).format(value);
};
