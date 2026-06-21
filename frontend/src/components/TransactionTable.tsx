// frontend/src/components/TransactionTable.tsx
import { formatCurrency, formatDate } from "../utils/formatters";
import type { Transaction } from "../types/Transaction";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenModal: () => void;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onOpenModal,
}: TransactionTableProps) {
  return (
    <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Transações</h2>
        <button
          onClick={onOpenModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Nova Transação
        </button>
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
                <tr key={t._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">
                    {t.description}
                    <span className="block text-xs text-gray-500 capitalize">
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{formatDate(t.date)}</td>
                  <td
                    className={`p-4 font-bold text-right ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}
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
                      onClick={() => onDelete(t._id)}
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
