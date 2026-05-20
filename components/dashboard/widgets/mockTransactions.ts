export type TransactionKind = "income" | "expense";

export interface TransactionRecord {
  id: string;
  title: string;
  amount: number;
  currency: string;
  kind: TransactionKind;
  dateLabel: string;
}

export interface TransactionSection {
  id: string;
  title: string;
  summary: string;
  items: TransactionRecord[];
}

export const mockTransactionRecords: TransactionRecord[] = [
  {
    id: "lot-com",
    title: "Lot.com",
    amount: -1015.99,
    currency: "PLN",
    kind: "expense",
    dateLabel: "Today · 09:20",
  },
  {
    id: "salary",
    title: "Salary",
    amount: 6753.19,
    currency: "PLN",
    kind: "income",
    dateLabel: "Yesterday · 18:00",
  },
  {
    id: "starbucks",
    title: "Starbucks",
    amount: -25,
    currency: "PLN",
    kind: "expense",
    dateLabel: "Yesterday · 12:15",
  },
  {
    id: "orlen",
    title: "Orlen",
    amount: -25,
    currency: "PLN",
    kind: "expense",
    dateLabel: "1 April",
  },
  {
    id: "public-transport",
    title: "Public Transport",
    amount: -16,
    currency: "USD",
    kind: "expense",
    dateLabel: "1 April",
  },
  {
    id: "pub",
    title: "Pub",
    amount: -13,
    currency: "EUR",
    kind: "expense",
    dateLabel: "1 April",
  },
];

export const mockTransactionSections: TransactionSection[] = [
  {
    id: "yesterday",
    title: "Yesterday",
    summary: "5712,2 $",
    items: mockTransactionRecords.slice(0, 3),
  },
  {
    id: "april-1",
    title: "1 April",
    summary: "-16 $ | -25 zł | -13€",
    items: mockTransactionRecords.slice(3),
  },
];