// frontend/src/components/TransactionModal.tsx
import type { ChangeEvent, FormEvent } from "react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  editingId: string | null;

  // Campos do Formulário
  type: "income" | "expense";
  setType: (type: "income" | "expense") => void;
  description: string;
  setDescription: (desc: string) => void;
  amount: string;
  onAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  date: string;
  setDate: (date: string) => void;
  category: string;
  setCategory: (cat: string) => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingId,
  type,
  setType,
  description,
  setDescription,
  amount,
  onAmountChange,
  date,
  setDate,
  category,
  setCategory,
}: TransactionModalProps) {
  // Se o modal estiver fechado, não desenha nada no ecrã
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editingId ? "Editar Transação" : "Nova Transação"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✖
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 rounded-lg font-medium text-sm transition ${type === "income" ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : "bg-gray-100 text-gray-500 border-2 border-transparent"}`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 rounded-lg font-medium text-sm transition ${type === "expense" ? "bg-red-100 text-red-700 border-2 border-red-500" : "bg-gray-100 text-gray-500 border-2 border-transparent"}`}
              >
                Despesa
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="text"
                required
                value={amount}
                onChange={onAmountChange}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                Selecione...
              </option>
              <option value="alimentacao">Alimentação</option>
              <option value="moradia">Moradia</option>
              <option value="transporte">Transporte</option>
              <option value="salario">Salário</option>
              <option value="lazer">Lazer</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition mt-4 disabled:opacity-70"
          >
            {isSubmitting
              ? "A salvar..."
              : editingId
                ? "Atualizar Transação"
                : "Salvar Transação"}
          </button>
        </form>
      </div>
    </div>
  );
}
