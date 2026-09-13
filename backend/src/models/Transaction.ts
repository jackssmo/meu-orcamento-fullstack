export interface Transaction {
  id?: number;
  user_id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: Date | string;
  category: string;
  is_fixed?: boolean;
  installments?: number;
  created_at?: Date;
}