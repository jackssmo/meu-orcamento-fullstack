import { formatCurrency, formatDate } from "../utils/formatters";
import type { Transaction } from "../types/Transaction";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
  onOpenModal: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onlyType: "all" | "income" | "expense";
  onTypeChange: (value: "all" | "income" | "expense") => void;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onOpenModal,
  search,
  onSearchChange,
  onlyType,
  onTypeChange,
}: TransactionTableProps) {
  return (
    <section className="surface overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Transações</h2>
        <button
          onClick={onOpenModal}
          className="bg-[#2454a6] hover:bg-[#1c4386] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + Nova Transação
        </button>
      </div>
      <div className="border-b border-gray-200 bg-[#fafbfd] p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por descrição ou categoria..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2454a6] focus:ring-2 focus:ring-[#c8d9f5]"
          />
          <select
            value={onlyType}
            onChange={(event) => onTypeChange(event.target.value as "all" | "income" | "expense")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2454a6] focus:ring-2 focus:ring-[#c8d9f5]"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Somente receitas</option>
            <option value="expense">Somente despesas</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Descrição</th>
              <th className="p-4 font-medium">Data</th>
              <th className="p-4 font-medium text-right">Valor</th>
              <th className="p-4 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Nenhuma transação neste mês.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">
                    {t.description}
                    <span className="block text-xs text-gray-500 capitalize">{t.category}</span>
                  </td>
                  <td className="p-4 text-gray-500">{formatDate(t.date)}</td>
                  <td
                    className={`p-4 font-bold text-right ${
                      t.type === "income" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                  </td>
                  <td className="p-4 text-center space-x-3">
                    <button
                      onClick={() => onEdit(t)}
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(t.id!)}
                      className="text-red-400 hover:text-red-600 transition"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}