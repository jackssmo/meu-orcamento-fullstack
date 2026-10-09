export interface Transaction {
  id?: number;
  user_id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  is_fixed?: boolean;
  installments?: number;
  installment_number?: number;
}