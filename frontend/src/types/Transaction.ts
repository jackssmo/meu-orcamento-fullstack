// frontend/src/types/Transaction.ts

export interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}
