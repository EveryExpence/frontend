export const normalizeNumberInput = (value: string): string => value.replace(/\s/g, '').replace(',', '.');

export const parseBalanceInput = (value: string): number => Number(normalizeNumberInput(value));

export const isValidBalanceInput = (value: string): boolean => {
  if (!value.trim()) return false;
  const parsed = parseBalanceInput(value);
  return Number.isFinite(parsed);
};

export const formatBalance = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  if (Number.isFinite(numericValue)) {
    return new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  }
  return String(value);
};
