import { formatCurrency } from "../utils/formatters";

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
}

export function SummaryCards({ income, expense, balance }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="surface stat-card stat-card-income">
        <div className="stat-card-icon stat-card-icon-income" aria-hidden="true">↑</div>
        <div>
          <p className="stat-label">Receitas</p>
          <h3 className="stat-value text-emerald-600">{formatCurrency(income)}</h3>
        </div>
      </div>
      <div className="surface stat-card stat-card-expense">
        <div className="stat-card-icon stat-card-icon-expense" aria-hidden="true">↓</div>
        <div>
          <p className="stat-label">Despesas</p>
          <h3 className="stat-value text-red-600">{formatCurrency(expense)}</h3>
        </div>
      </div>
      <div className="surface stat-card">
        <div>
          <p className="stat-label">Saldo total</p>
          <h3 className={`stat-value ${balance >= 0 ? "text-[#2454a6]" : "text-red-600"}`}>{formatCurrency(balance)}</h3>
        </div>
      </div>
    </div>
  );
}