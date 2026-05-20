export type TransactionKind = "income" | "expense";

export interface TransactionRecord {
  id: string;
  title: string;
  amount: number;
  currency: string;
  kind: TransactionKind;
  dateLabel: string;
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
];