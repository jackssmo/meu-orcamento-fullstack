import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
// NOVO: Importando a biblioteca de notificações
import toast, { Toaster } from "react-hot-toast";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Estados do Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados para os Filtros
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const token = localStorage.getItem("fintrack_token");
    if (!token) {
      navigate("/login");
      return;
    }

    api
      .get("/profile")
      .then((response) => {
        setUserName(response.data.name);
      })
      .catch(() => {
        localStorage.removeItem("fintrack_token");
        navigate("/login");
      });

    fetchTransactions();
  }, [navigate]);

  async function fetchTransactions() {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar transações.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja apagar esta transação?"))
      return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter((t) => t._id !== id));
      toast.success("Transação apagada com sucesso!"); // NOVO: Toast de Sucesso
    } catch (error) {
      console.error(error);
      toast.error("Erro ao apagar a transação."); // NOVO: Toast de Erro
    }
  }

  function handleEditClick(transaction: Transaction) {
    setDescription(transaction.description);

    // NOVO: Formata o número que vem do banco (ex: 1500.5) para a máscara (1.500,50)
    const formattedAmount = transaction.amount
      .toFixed(2)
      .replace(".", ",")
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    setAmount(formattedAmount);

    setType(transaction.type);
    setCategory(transaction.category);
    setDate(transaction.date.substring(0, 10));
    setEditingId(transaction._id);
    setIsModalOpen(true);
  }

  // NOVO: Função para formatar o valor como Real enquanto o usuário digita
  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    if (value === "") {
      setAmount("");
      return;
    }
    // Converte para decimal e adiciona pontos e vírgulas
    const numericValue = (Number(value) / 100).toFixed(2);
    const formattedValue = numericValue
      .replace(".", ",")
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

    setAmount(formattedValue);
  }

  async function handleSubmitTransaction(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // NOVO: Converte a string "1.500,50" de volta para o número 1500.50 pro banco de dados
      const numericAmount = Number(amount.replace(/\./g, "").replace(",", "."));
      const data = { description, amount: numericAmount, type, category, date };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, data);
        toast.success("Transação atualizada com sucesso!");
      } else {
        await api.post("/transactions", data);
        toast.success("Nova transação salva!");
      }

      closeModal();
      await fetchTransactions();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar transação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeModal() {
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("");
    setDate("");
    setEditingId(null);
    setIsModalOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("fintrack_token");
    navigate("/login");
  }

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return (
      tDate.getUTCMonth() + 1 === selectedMonth &&
      tDate.getUTCFullYear() === selectedYear
    );
  });

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const expensesByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* NOVO: O componente Toaster gerencia as notificações na tela */}
      <Toaster position="bottom-right" reverseOrder={false} />

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3 text-white font-bold">
              MO
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Meu Orçamento</h1>
              <p className="text-sm text-gray-500">
                Bem-vindo,{" "}
                <span className="font-medium text-indigo-600">
                  {userName || "..."}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
            Resumo Financeiro
          </h2>
          <div className="flex space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value={1}>Janeiro</option>
              <option value={2}>Fevereiro</option>
              <option value={3}>Março</option>
              <option value={4}>Abril</option>
              <option value={5}>Maio</option>
              <option value={6}>Junho</option>
              <option value={7}>Julho</option>
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
              <option value={11}>Novembro</option>
              <option value={12}>Dezembro</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Transações
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
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
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Nenhuma transação neste mês.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-medium text-gray-900">
                          {t.description}
                          <span className="block text-xs text-gray-500 capitalize">
                            {t.category}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">
                          {formatDate(t.date)}
                        </td>
                        <td
                          className={`p-4 font-bold text-right ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {t.type === "income" ? "+" : "-"}{" "}
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="p-4 text-center space-x-3">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="text-blue-500 hover:text-blue-700 transition"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
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

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Gastos por Categoria
            </h2>
            {expense === 0 ? (
              <p className="text-sm text-center text-gray-500">
                Sem despesas neste mês.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, val]) => {
                    const percentage = Math.round((val / expense) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 capitalize">
                            {cat}
                          </span>
                          <span className="text-gray-500">
                            {formatCurrency(val)} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-indigo-500 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Editar Transação" : "Nova Transação"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✖
              </button>
            </div>
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
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
                  {/* NOVO: Input modificado para texto para aceitar a máscara corretamente */}
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={handleAmountChange}
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
      )}
    </div>
  );
}
