import { useCallback, useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Header } from "../components/Header";
import { SummaryCards } from "../components/SummaryCards";
import { TransactionTable } from "../components/TransactionTable";
import { TransactionModal } from "../components/TransactionModal";
import type { Transaction } from "../types/Transaction";
import { formatCurrency } from "../utils/formatters";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

function getTodayInputValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

const categoryLabels: Record<string, string> = {
  alimentacao: "Alimentação",
  moradia: "Moradia",
  transporte: "Transporte",
  salario: "Salário",
  lazer: "Lazer",
  saude: "Saúde",
  educacao: "Educação",
  assinaturas: "Assinaturas",
  compras: "Compras",
  viagens: "Viagens",
  impostos: "Impostos e taxas",
  investimentos: "Investimentos",
  dividas: "Dívidas",
  outros: "Outros",
};

const categoryColors = ["#2454a6", "#4f82d1", "#73b49a", "#e0ae4f", "#de6b67", "#8c72b2", "#5aa6ae", "#9aabbc"];
const categoryColorMap: Record<string, string> = {
  alimentacao: "#2454a6",
  moradia: "#4f82d1",
  transporte: "#73b49a",
  salario: "#e0ae4f",
  lazer: "#de6b67",
  saude: "#8c72b2",
  educacao: "#5aa6ae",
  assinaturas: "#9aabbc",
  compras: "#d4773f",
  viagens: "#bd6c9b",
  impostos: "#63738a",
  investimentos: "#2d8a70",
  dividas: "#b04d58",
  outros: "#8b8f98",
};
const monthLabels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function getCategoryColor(category: string): string {
  const normalizedCategory = category.toLowerCase().trim();
  const mappedColor = categoryColorMap[normalizedCategory];
  if (mappedColor) return mappedColor;

  let hash = 0;
  for (let index = 0; index < normalizedCategory.length; index += 1) {
    hash = (hash * 31 + normalizedCategory.charCodeAt(index)) >>> 0;
  }
  return categoryColors[hash % categoryColors.length];
}

export function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getTodayInputValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isFixed, setIsFixed] = useState(false);
  const [installments, setInstallments] = useState("1");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [onlyType, setOnlyType] = useState<"all" | "income" | "expense">("all");
  const [monthlyHistory, setMonthlyHistory] = useState<{ month: number; income: number; expense: number }[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, realizedBalance: 0 });
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get("/transactions", {
        params: { month: selectedMonth, year: selectedYear, search, type: onlyType === "all" ? undefined : onlyType, page, pageSize: 20 },
      });
      setTransactions(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar transações.");
    }
  }, [selectedMonth, selectedYear, search, onlyType, page]);

  const refreshFinancialData = useCallback(async () => {
    const [summaryResponse, historyResponse, categoryResponse] = await Promise.all([
      api.get("/transactions/summary", { params: { month: selectedMonth, year: selectedYear } }),
      api.get("/financial/reports/monthly", { params: { year: selectedYear } }),
      api.get("/financial/reports/monthly", { params: { month: selectedMonth, year: selectedYear } }),
    ]);

    setSummary(summaryResponse.data);
    setMonthlyHistory(historyResponse.data.monthly);
    setCategoryTotals(
      categoryResponse.data.byCategory
        .filter((item: { type: string }) => item.type === "expense")
        .reduce((result: Record<string, number>, item: { category: string; total: number }) => {
          result[item.category] = Number(item.total);
          return result;
        }, {}),
    );
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const token = localStorage.getItem("fintrack_token");
    if (!token) {
      navigate("/login");
      return;
    }

    api.get("/auth/profile") // ou /profile dependendo de como configurou
      .then((res) => setUserName(res.data.name || "Usuário"))
      .catch(() => setUserName("Usuário"));

    void Promise.resolve().then(fetchTransactions);
    void Promise.resolve().then(refreshFinancialData).catch(() => {
      setSummary({ totalIncome: 0, totalExpense: 0, balance: 0, realizedBalance: 0 });
      setMonthlyHistory([]);
      setCategoryTotals({});
    });
    api.get("/financial/categories")
      .then((response) => setCustomCategories(response.data.map((item: { name: string }) => item.name)))
      .catch(() => setCustomCategories([]));
  }, [fetchTransactions, navigate, refreshFinancialData]);

  function closeModal() {
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("");
    setDate(getTodayInputValue());
    setIsFixed(false);
    setInstallments("1");
    setEditingId(null);
    setIsModalOpen(false);
  }

  function handleEditClick(transaction: Transaction) {
    setDescription(transaction.description);
    const formattedAmount = Number(transaction.amount)
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
      await Promise.all([fetchTransactions(), refreshFinancialData()]);
    } catch (error) {
      console.error(error);
      const message = isAxiosError(error)
        ? error.response?.data?.error || error.response?.data?.message
        : undefined;
      toast.error(message || "Erro ao salvar transação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(transaction: Transaction) {
    if (!transaction.id) return;

    const isInstallmentExpense =
      transaction.type === "expense" &&
      !transaction.is_fixed &&
      (transaction.installments || 1) > 1;
    let scope = "";

    if (isInstallmentExpense) {
      const deleteSeries = window.confirm(
        "Esta despesa possui parcelas. Clique em OK para apagar todas as parcelas ou em Cancelar para escolher apagar somente esta parcela.",
      );
      if (deleteSeries) {
        scope = "?scope=series";
      } else if (!window.confirm("Apagar somente a parcela deste mês?")) {
        return;
      }
    } else if (
      !window.confirm("Tem certeza que deseja apagar esta transação? Receitas fixas também removem os próximos meses.")
    ) {
      return;
    }

    try {
      const response = await api.delete(`/transactions/${transaction.id}${scope}`);
      await Promise.all([fetchTransactions(), refreshFinancialData()]);
      toast.success(response.data.message || "Transação apagada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao apagar transação.");
    }
  }

  const filteredTransactions = transactions;

  const income = Number(summary.totalIncome);
  const expense = Number(summary.totalExpense);
  const balance = Number(summary.balance);

  const expensesByCategory = categoryTotals;
  const categoryEntries = Object.entries(expensesByCategory).sort(([, first], [, second]) => second - first);
  const categoryTotal = categoryEntries.reduce((total, [, value]) => total + value, 0);
  let categoryOffset = 0;
  const categoryGradient = categoryEntries.length > 0
    ? categoryEntries.map(([, value], index) => {
      const start = categoryOffset;
      categoryOffset += (value / categoryTotal) * 100;
      return `${getCategoryColor(categoryEntries[index][0])} ${start}% ${categoryOffset}%`;
    }).join(", ")
    : "#e8edf3 0% 100%";

  return (
    <div className="app-layout">
      <Header userName={userName} />

      <main className="app-content space-y-8">
        {/* Barra de Filtro de Mês/Ano */}
        <div className="page-heading">
          <div>
            <h1>Olá, {userName || "bem-vindo"}</h1>
            <p>Acompanhe o que está acontecendo com o seu dinheiro.</p>
            <div className="selected-period mt-4">
              <span className="selected-period-label">Período selecionado</span>
              <strong>{monthLabels[selectedMonth - 1]} de {selectedYear}</strong>
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - 2 + index).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Evolução anual: também funciona como seletor de mês. */}
        <div className="surface p-5">
          <div className="section-title">
            <h2>Evolução do ano</h2>
            <span>Toque em um mês para selecionar</span>
          </div>
          <div className="flex h-20 items-end gap-2">
            {Array.from({ length: 12 }, (_, index) => {
              const item = monthlyHistory.find((month) => month.month === index + 1);
              const value = Number(item?.income || 0) + Number(item?.expense || 0);
              const max = Math.max(...monthlyHistory.map((month) => Number(month.income) + Number(month.expense)), 1);
              const month = index + 1;
              const isSelected = selectedMonth === month;
              return (
                <button
                  key={month}
                  type="button"
                  title={`Selecionar ${monthLabels[index]}: ${formatCurrency(value)}`}
                  aria-label={`Selecionar ${monthLabels[index]}`}
                  onClick={() => {
                    setSelectedMonth(month);
                    setPage(1);
                  }}
                  className={`flex-1 rounded-t transition ${isSelected ? "bg-[#2454a6]" : "bg-[#8bb9a5] hover:bg-[#2454a6]"}`}
                  style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
                />
              );
            })}
          </div>
          <div className="month-picker" aria-label="Selecionar mês">
            {monthLabels.map((month, index) => (
              <button
                key={month}
                type="button"
                className={selectedMonth === index + 1 ? "month-picker-button active" : "month-picker-button"}
                onClick={() => {
                  setSelectedMonth(index + 1);
                  setPage(1);
                }}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Cards de resumo */}
        <SummaryCards income={income} expense={expense} balance={balance} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionTable
              transactions={filteredTransactions}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onOpenModal={() => setIsModalOpen(true)}
              search={search}
              onSearchChange={setSearch}
              onlyType={onlyType}
              onTypeChange={setOnlyType}
            />
            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between px-2 text-sm text-slate-500">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">Anterior</button>
                  <button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">Próxima</button>
                </div>
              </div>
            )}
          </div>

          <section className="surface p-6 h-fit">
            <div className="section-title">
              <h2>Gastos por categoria</h2>
              <span>{formatCurrency(categoryTotal)}</span>
            </div>
            {expense === 0 ? (
              <p className="text-sm text-center text-gray-500">Sem despesas neste mês</p>
            ) : (
              <div>
                <div className="flex justify-center py-2">
                  <div
                    className="relative grid h-40 w-40 place-items-center rounded-full"
                    style={{ background: `conic-gradient(${categoryGradient})` }}
                    aria-label="Distribuição das despesas por categoria"
                  >
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Despesas</span>
                      <strong className="text-sm text-slate-700">{formatCurrency(categoryTotal)}</strong>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                {categoryEntries.map(([cat, val]) => {
                    const percentage = Math.round((val / categoryTotal) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2 font-medium text-gray-700">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                            {categoryLabels[cat] || cat}
                          </span>
                          <span className="text-gray-500">{formatCurrency(val)} <span className="text-xs">({percentage}%)</span></span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full"
                            style={{ width: `${percentage}%`, backgroundColor: getCategoryColor(cat) }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
        categories={customCategories}
      />
    </div>
  );
}