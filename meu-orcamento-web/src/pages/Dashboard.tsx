import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fintrack_token');
    if (!token) {
      navigate('/login');
      return;
    }

    api.get('/profile').then(response => {
      setUserName(response.data.name);
    }).catch(() => {
      localStorage.removeItem('fintrack_token');
      navigate('/login');
    });

    fetchTransactions();
  }, [navigate]);

  // Função isolada para buscar transações, assim podemos chamá-la de novo após criar uma nova
  async function fetchTransactions() {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('fintrack_token');
    navigate('/login');
  }

  async function handleCreateTransaction(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/transactions', {
        description,
        amount: Number(amount), // Garante que envia como número
        type,
        category,
        date
      });

      // Limpa o formulário, fecha o modal e recarrega a lista
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('');
      setDate('');
      setIsModalOpen(false);
      
      await fetchTransactions(); // Atualiza a tela com a nova transação
    } catch (error) {
      console.error('Erro ao criar transação', error);
      alert('Erro ao salvar transação. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3 text-white font-bold">
              MO
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Meu Orçamento</h1>
              <p className="text-sm text-gray-500">
                Bem-vindo, <span className="font-medium text-indigo-600">{userName || '...'}</span>
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium text-sm px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition duration-200">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Resumo Financeiro */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Receitas</p>
                <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(income)}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">+</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Despesas</p>
                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(expense)}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">-</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Saldo Atual</p>
                <h3 className="text-2xl font-bold text-indigo-600">{formatCurrency(balance)}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">$</div>
            </div>
          </div>
        </section>

        {/* Tabela de Transações */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Transações Recentes</h2>
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
                  <th className="p-4 font-medium">Categoria</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">A carregar dados...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma transação encontrada. Comece a adicionar!</td></tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">{transaction.description}</td>
                      <td className="p-4 text-gray-500 capitalize">{transaction.category}</td>
                      <td className="p-4 text-gray-500">{formatDate(transaction.date)}</td>
                      <td className={`p-4 font-bold text-right ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL DE NOVA TRANSAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Nova Transação</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✖
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 rounded-lg font-medium text-sm transition ${type === 'income' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500' : 'bg-gray-100 text-gray-500 border-2 border-transparent'}`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 rounded-lg font-medium text-sm transition ${type === 'expense' ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100 text-gray-500 border-2 border-transparent'}`}
                  >
                    Despesa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input 
                  type="text" required value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Salário, Almoço, Internet..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" required step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date" required value={date} onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select 
                  required value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="alimentacao">Alimentação</option>
                  <option value="moradia">Moradia</option>
                  <option value="transporte">Transporte</option>
                  <option value="salario">Salário</option>
                  <option value="lazer">Lazer</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition mt-4 disabled:opacity-70"
              >
                {isSubmitting ? 'A salvar...' : 'Salvar Transação'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}