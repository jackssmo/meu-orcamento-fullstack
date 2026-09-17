import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Header } from "../components/Header";
import { SummaryCards } from "../components/SummaryCards";
import { TransactionTable } from "../components/TransactionTable";
import { TransactionModal } from "../components/TransactionModal";
import type { Transaction } from "../types/Transaction";
import { formatCurrency } from "../utils/formatters";
import toast from "react-hot-toast";

export function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isFixed, setIsFixed] = useState(false);
  const [installments, setInstallments] = useState("1");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const token = localStorage.getItem("fintrack_token");
    if (!token) {
      navigate("/login");
      return;
    }

    api.get("/auth/profile") // ou /profile dependendo de como configurou
      .then((res) => setUserName(res.data.name || "Usuário"))
      .catch(() => setUserName("Usuário"));

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

  function closeModal() {
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("");
    setDate("");
    setIsFixed(false);
    setInstallments("1");
    setEditingId(null);
    setIsModalOpen(false);
  }

  function handleEditClick(transaction: Transaction) {
    setDescription(transaction.description);
    const formattedAmount = transaction.amount
      .toFixed(2)
      .replace(".", ",")
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    setAmount(formattedAmount);
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(String(transaction.date).substring(0, 10));
    setEditingId(transaction.id || null);
    setIsModalOpen(true);
  }

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if (value === "") {
      setAmount("");
      return;
    }
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
      const numericAmount = Number(amount.replace(/\./g, "").replace(",", "."));
      
      const data = {
        description,
        amount: numericAmount,
        type,
        category,
        date,
        is_fixed: isFixed,
        installments: Number(installments),
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, { description, amount: numericAmount, type, category, date });
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

  async function handleDelete(id: number) {
    if (!window.confirm("Tem certeza que deseja apagar esta transação?")) return;

    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter((t) => t.id !== id));
      toast.success("Transação apagada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao apagar transação.");
    }
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
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header userName={userName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Barra de Filtro de Mês/Ano */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Resumo Financeiro</h2>
          <div className="flex space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de Saldo */}
        <SummaryCards income={income} expense={expense} balance={balance} />

        {/* Grid Principal (Tabela + Gráfico de Categorias) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionTable
              transactions={filteredTransactions}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onOpenModal={() => setIsModalOpen(true)}
            />
          </div>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Gastos por Categoria</h2>
            {expense === 0 ? (
              <p className="text-sm text-center text-gray-500">Sem despesas neste mês</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, val]) => {
                    const percentage = Math.round((val / expense) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 capitalize">{cat}</span>
                          <span className="text-gray-500">{formatCurrency(val)} ({percentage}%)</span>
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

      <TransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitTransaction}
        isSubmitting={isSubmitting}
        editingId={editingId}
        type={type}
        setType={setType}
        description={description}
        setDescription={setDescription}
        amount={amount}
        onAmountChange={handleAmountChange}
        date={date}
        setDate={setDate}
        category={category}
        setCategory={setCategory}
        isFixed={isFixed}
        setIsFixed={setIsFixed}
        installments={installments}
        setInstallments={setInstallments}
      />
    </div>
  );
}