import { MaterialCommunityIcons } from '@expo/vector-icons';

const accountIcons = [
  'cash',
  'cash-multiple',
  'wallet',
  'wallet-outline',
  'bank',
  'bank-outline',
  'credit-card',
  'credit-card-outline',
  'chart-line',
  'briefcase',
] as const satisfies readonly (keyof typeof MaterialCommunityIcons.glyphMap)[];

export type AccountIconName = (typeof accountIcons)[number];

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

export const getAccountIconName = (accountId: string): AccountIconName => {
  const index = hashString(accountId) % accountIcons.length;
  return accountIcons[index];
};