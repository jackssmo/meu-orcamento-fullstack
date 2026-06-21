// frontend/src/components/SummaryCards.tsx
import { formatCurrency } from "../utils/formatters";

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
}

export function SummaryCards({ income, expense, balance }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Receitas</p>
          <h3 className="text-2xl font-bold text-emerald-600">
            {formatCurrency(income)}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
          +
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Despesas</p>
          <h3 className="text-2xl font-bold text-red-600">
            {formatCurrency(expense)}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
          -
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Saldo</p>
          <h3 className="text-2xl font-bold text-indigo-600">
            {formatCurrency(balance)}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
          $
        </div>
      </div>
    </div>
  );
}
