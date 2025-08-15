document.addEventListener('DOMContentLoaded', () => {
    const categories = {
        expense: [
            { value: 'food', text: 'Alimentação' }, { value: 'transport', text: 'Transporte' },
            { value: 'housing', text: 'Moradia' }, { value: 'debts', text: 'Dívidas' },
            { value: 'personal_care', text: 'Cuidados Pessoais' }, { value: 'entertainment', text: 'Lazer' },
            { value: 'health', text: 'Saúde' }, { value: 'education', text: 'Educação' },
            { value: 'other', text: 'Outros' }
        ],
        income: [
            { value: 'salary', text: 'Salário' }, { value: 'sales', text: 'Vendas' },
            { value: 'freelance', text: 'Freelance' }, { value: 'investment', text: 'Investimentos' },
            { value: 'other', text: 'Outros' }
        ]
    };

    let transactions = [];
    let recurringTransactions = [];
    let budget = 0;
    let currentUserEmail = null;
    let currentUserName = null;
    let viewMode = 'monthly';
    let editState = { active: false, transactionId: null };
    let categoryChart, annualChart;
    let holidays = {};
    let notifications = [];
    let googleUser = null;
    let currentPage = 1;
    const transactionsPerPage = 10;

    let mainAppListenersAttached = false;
    let authListenersAttached = false;

    let currentDisplayDate = new Date();
    currentDisplayDate.setHours(0, 0, 0, 0);

    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            if (!page.classList.contains('hidden')) {
                page.classList.add('hidden');
            }
        });
        const pageToShow = document.getElementById(pageId);
        if (pageToShow) {
            pageToShow.classList.remove('hidden');
            if (pageId === 'auth-container') pageToShow.classList.add('flex');
        }
    }

    function showScreenInAuth(screenName) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('signup-screen').classList.add('hidden');
        document.getElementById('reset-password-screen').classList.add('hidden');
        document.getElementById(screenName + '-screen').classList.remove('hidden');
    }

    function togglePasswordVisibility(inputId, toggleElement) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const icon = toggleElement.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
    
    function showLoading(buttonId, show) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        const spinner = document.getElementById(buttonId.replace('-btn', '-spinner'));
        const text = document.getElementById(buttonId.replace('-btn', '-btn-text'));

        if (show) {
            button.disabled = true;
            if (spinner) spinner.classList.remove('hidden');
            if (text) text.classList.add('hidden');
        } else {
            button.disabled = false;
            if (spinner) spinner.classList.add('hidden');
            if (text) text.classList.remove('hidden');
        }
    }

    async function handleGoogleSignIn(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            googleUser = {
                email: payload.email,
                name: payload.name || payload.email.split('@')[0],
                picture: payload.picture || null
            };
            const usersDb = JSON.parse(localStorage.getItem('fintrack_users_db')) || {};
            if (!usersDb[googleUser.email]) {
                usersDb[googleUser.email] = {
                    name: googleUser.name,
                    password: null,
                    data: { transactions: [], budget: 0, recurringTransactions: [], googleUser: googleUser }
                };
                localStorage.setItem('fintrack_users_db', JSON.stringify(usersDb));
                showAlert('Conta criada com sucesso via Google!', 'success');
            }
            localStorage.setItem('fintrack_session', googleUser.email);
            initializeApp();
        } catch (error) {
            console.error('Erro no login com Google:', error);
            showAlert('Erro ao fazer login com Google. Tente novamente.', 'error');
        }
    }

    async function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // ... (mantenha suas validações de campos vazios, senha, etc.)

    showLoading('signup-submit-btn', true);
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            throw new Error('Erro ao criar conta. O e-mail pode já estar em uso.');
        }

        showAlert('Conta criada com sucesso! Faça o login.', 'success');
        document.getElementById('signup-form').reset();
        showScreenInAuth('login');

    } catch (error) {
        console.error('Erro ao criar conta:', error);
        showAlert(error.message, 'error');
    } finally {
        showLoading('signup-submit-btn', false);
    }
}

    async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showAlert('Preencha e-mail e senha.', 'warning');

    showLoading('login-submit-btn', true);
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            // Se a resposta não for 2xx, lê a mensagem de erro do backend
            const errorData = await response.text();
            throw new Error(errorData || 'E-mail ou senha inválidos.');
        }

        const data = await response.json();
        localStorage.setItem('fintrack_token', data.token); // Salva o TOKEN, não mais o email
        
        // A função initializeApp precisará ser adaptada para usar o token
        initializeApp();

    } catch (error) {
        console.error('Erro no login:', error);
        showAlert(error.message, 'error');
    } finally {
        showLoading('login-submit-btn', false);
    }
}

    function handleLogout() {
    // 1. Remove o token de autenticação do localStorage
    localStorage.removeItem('fintrack_token');

    // 2. Limpa as variáveis de estado globais
    currentUserEmail = null;
    currentUserName = null;
    transactions = [];
    
    // 3. Reinicia a aplicação. A initializeApp() vai ver que não há token
    // e mostrará a tela de login automaticamente.
    initializeApp();
}
    function handleForgotPassword(e) { e.preventDefault(); showScreenInAuth('reset-password'); }
    function handleResetPassword(e) {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        if (!email) return showAlert('Digite seu e-mail.', 'warning');
        showLoading('reset-submit-btn', true);
        setTimeout(() => {
            showLoading('reset-submit-btn', false);
            showAlert(`Se uma conta com o e-mail ${email} existir, um link de redefinição foi enviado.`, 'success');
            showScreenInAuth('login');
        }, 1500);
    }

    function getAuthHeader() {
  const token = localStorage.getItem('fintrack_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Carrega os dados do backend, não mais do localStorage
async function loadDataForCurrentUser() {
  const token = localStorage.getItem('fintrack_token');
  if (!token) return;

  try {
    const response = await fetch('/transactions', {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Erro ao buscar transações.');

    transactions = await response.json(); // 'transactions' agora é preenchido com dados da API

    // O orçamento e recorrências ainda não estão no backend, vamos mantê-los locais por enquanto
    budget = parseFloat(localStorage.getItem(`${currentUserEmail}_budget`)) || 0;
    recurringTransactions = JSON.parse(localStorage.getItem(`${currentUserEmail}_recurring`)) || [];
    
    document.getElementById('monthlyBudget').value = budget > 0 ? budget.toFixed(2) : '';
    updateUI(); // Atualiza a tela com os novos dados

  } catch (error) {
    console.error(error);
    showAlert('Não foi possível carregar seus dados.', 'error');
    // Se o token for inválido, desloga o usuário
    if (error.response && error.response.status === 401) {
      handleLogout();
    }
  }
}

// Esta função não vai mais salvar transações, apenas orçamento e recorrências (por enquanto)
function saveDataForCurrentUser() {
    if (!currentUserEmail) return;
    localStorage.setItem(`${currentUserEmail}_budget`, budget);
    localStorage.setItem(`${currentUserEmail}_recurring`, JSON.stringify(recurringTransactions));
}

// meuOrçamento/app.js

// Substitua sua função handleFormSubmit por esta
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Pega os dados do formulário (lógica que você já tem)
    const description = document.getElementById('transactionDescription').value.trim();
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const type = document.getElementById('transactionType').value;
    const date = document.getElementById('transactionDate').value;
    const category = type === 'income' 
        ? document.getElementById('transactionCategoryIncome').value 
        : document.getElementById('transactionCategoryExpense').value;

    if (!description || isNaN(amount) || amount <= 0 || !date) {
        return showAlert('Preencha todos os campos corretamente.', 'warning');
    }

    const transactionData = { description, amount, type, date, category };

    const isEditing = editState.active;
    const url = isEditing 
        ? `/transactions/${editState.transactionId}` 
        : '/transactions';
    
    const method = isEditing ? 'PATCH' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeader(),
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            throw new Error(isEditing ? 'Erro ao atualizar transação.' : 'Erro ao salvar transação.');
        }

        const resultTransaction = await response.json();

        if (isEditing) {
            // Se estava editando, encontra a transação na lista e a atualiza
            const index = transactions.findIndex(t => t._id === editState.transactionId);
            if (index !== -1) {
                transactions[index] = resultTransaction;
            }
        } else {
            // Se estava criando, adiciona a nova transação à lista
            transactions.push(resultTransaction);
        }

        showAlert(isEditing ? 'Transação atualizada!' : 'Transação adicionada!', 'success');
        resetFormAndState();
        updateUI();

    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message, 'error');
    }
}
    function updateNotificationBadge() {
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notification-badge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    function updateMonthYearDisplay() {
        const monthSelect = document.getElementById('monthSelect');
        if (monthSelect.options.length <= 1) {
            monthSelect.innerHTML = '';
            const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            months.forEach((m, i) => monthSelect.add(new Option(m, i)));
        }
        monthSelect.value = currentDisplayDate.getMonth();
        const yearSelect = document.getElementById('yearSelect');
        if (yearSelect.options.length === 0) {
            const currentYear = new Date().getFullYear();
            for (let year = currentYear - 10; year <= currentYear + 5; year++) {
                yearSelect.add(new Option(year, year));
            }
        }
        yearSelect.value = currentDisplayDate.getFullYear();
    }

    function handleMonthYearChange() {
        const month = parseInt(document.getElementById('monthSelect').value);
        const year = parseInt(document.getElementById('yearSelect').value);
        currentDisplayDate = new Date(year, month, 1);
        currentPage = 1;
        updateUI();
    }


    // Substitua a sua função window.deleteTransaction por esta

window.deleteTransaction = async function (id) {
  // A lógica de confirmação que você já tinha
  if (!confirm('Tem certeza que deseja excluir esta transação?')) {
    return;
  }

  try {
    // Faz a chamada para a API, passando o ID da transação na URL
    const response = await fetch(`/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader() // Envia o token para autorização
    });

    if (!response.ok) {
      throw new Error('Falha ao apagar a transação.');
    }

    // Remove a transação da lista local para atualizar a tela instantaneamente
    transactions = transactions.filter(t => t._id !== id);
    updateUI(); // Atualiza a interface

    showAlert('Transação excluída com sucesso!', 'info');

  } catch (error) {
    console.error('Erro ao apagar transação:', error);
    showAlert(error.message, 'error');
  }
}

   // Substitua a sua função window.startEditTransaction por esta

window.startEditTransaction = function (id) {
    // A correção está aqui: usamos t._id em vez de t.id
    const transaction = transactions.find(t => t._id === id); 
    
    if (!transaction) return;

    // Esta parte do seu código já estava correta, mas a estamos a manter.
    if (transaction.isRecurring) return showAlert('Transações recorrentes não podem ser editadas. Exclua a regra em "Minhas Recorrências".', 'info');
    if (transaction.installmentGroupId) return showAlert('A edição de parcelas não é permitida.', 'info');
    
    editState = { active: true, transactionId: id };
    
    document.getElementById('form-title').textContent = "Editar Transação";
    document.getElementById('transactionType').value = transaction.type;
    toggleCategoryFields();
    
    if (transaction.type === 'income') {
        document.getElementById('transactionCategoryIncome').value = transaction.category;
    } else {
        document.getElementById('transactionCategoryExpense').value = transaction.category;
    }
    
    document.getElementById('transactionDescription').value = transaction.description;
    document.getElementById('transactionAmount').value = transaction.amount.toFixed(2);
    document.getElementById('transactionDate').value = new Date(transaction.date).toISOString().split('T')[0]; // Garante o formato correto da data
    
    document.getElementById('submitBtn').textContent = "Salvar Alterações";
    document.getElementById('cancelBtn').classList.remove('hidden');
    document.getElementById('isInstallment').disabled = true;
    document.getElementById('isRecurring').disabled = true;
    document.getElementById('form-section').scrollIntoView({ behavior: "smooth" });
}

    function saveMonthlyBudget() {
        const newBudget = parseFloat(document.getElementById('monthlyBudget').value);
        if (isNaN(newBudget) || newBudget < 0) return showAlert('Orçamento inválido.', 'warning');
        budget = newBudget; saveDataForCurrentUser(); updateBudgetDisplay(); showAlert('Orçamento salvo!', 'success');
    }

    function setupAuthEventListeners() {
        if (authListenersAttached) return;
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('signup-form').addEventListener('submit', handleSignUp);
        document.getElementById('reset-password-form').addEventListener('submit', handleResetPassword);
        document.getElementById('forgot-password').addEventListener('click', handleForgotPassword);
        document.getElementById('show-signup').addEventListener('click', (e) => { e.preventDefault(); showScreenInAuth('signup'); });
        document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); showScreenInAuth('login'); });
        document.getElementById('back-to-login').addEventListener('click', (e) => { e.preventDefault(); showScreenInAuth('login'); });
        document.querySelectorAll('#auth-container .password-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const inputContainer = toggle.parentElement;
                const input = inputContainer.querySelector('input');
                if (input) togglePasswordVisibility(input.id, toggle);
            });
        });
        authListenersAttached = true;
        console.log("Eventos de autenticação configurados.");
    }

    function setupMainAppEventListeners() {
        if (mainAppListenersAttached) return;
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
});
        document.getElementById('transactionForm').addEventListener('submit', handleFormSubmit);
        document.getElementById('transactionType').addEventListener('change', toggleCategoryFields);
        document.getElementById('cancelBtn').addEventListener('click', resetFormAndState);
        document.getElementById('themeToggleBtn').addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme();
        });
        document.getElementById('saveBudget').addEventListener('click', saveMonthlyBudget);
        document.getElementById('exportCsvBtn').addEventListener('click', (e) => {
            e.preventDefault();
            exportToCSV();
        });
        document.getElementById('profileBtn').addEventListener('click', (e) => {
            e.preventDefault();
            showAlert('A página de Perfil ainda está em desenvolvimento.', 'info');
        });
        document.getElementById('settingsBtn').addEventListener('click', (e) => {
            e.preventDefault();
            showAlert('A página de Configurações ainda está em desenvolvimento.', 'info');
        });
        document.getElementById('filterAll').addEventListener('click', () => filterTransactions('all'));
        document.getElementById('filterIncome').addEventListener('click', () => filterTransactions('income'));
        document.getElementById('filterExpense').addEventListener('click', () => filterTransactions('expense'));
        document.getElementById('monthlyBtn').addEventListener('click', () => setViewMode('monthly'));
        document.getElementById('yearlyBtn').addEventListener('click', () => setViewMode('yearly'));
        document.getElementById('searchInput').addEventListener('input', () => { currentPage = 1; updateUI(); });
        const isInstallmentCheck = document.getElementById('isInstallment');
        const isRecurringCheck = document.getElementById('isRecurring');
        isInstallmentCheck.addEventListener('change', () => {
            document.getElementById('installment-details').classList.toggle('hidden', !isInstallmentCheck.checked);
            if (isInstallmentCheck.checked) {
                isRecurringCheck.checked = false;
                document.getElementById('recurring-details').classList.add('hidden');
                document.getElementById('date-field-container').classList.remove('hidden');
                document.getElementById('dateLabel').textContent = "Data da 1ª Parcela";
            } else document.getElementById('dateLabel').textContent = "Data";
        });
        isRecurringCheck.addEventListener('change', () => {
            document.getElementById('recurring-details').classList.toggle('hidden', !isRecurringCheck.checked);
            document.getElementById('date-field-container').classList.toggle('hidden', isRecurringCheck.checked);
            if (isRecurringCheck.checked) {
                isInstallmentCheck.checked = false;
                document.getElementById('installment-details').classList.add('hidden');
            }
        });
        document.getElementById('monthSelect').addEventListener('change', handleMonthYearChange);
        document.getElementById('yearSelect').addEventListener('change', handleMonthYearChange);
        document.getElementById('transactionDate').valueAsDate = new Date();
        document.getElementById('notifications-btn').addEventListener('click', () => showAlert('Notificações ainda não implementadas. Em breve!', 'info'));

        const userMenuBtn = document.getElementById('user-menu-btn');
        const userMenu = document.getElementById('user-menu');
        const userMenuContainer = userMenuBtn.parentElement;
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        if (isTouchDevice) {
            userMenuContainer.classList.remove('group');
            userMenu.classList.remove('group-hover:block');
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('hidden');
            });
        }
        
        window.addEventListener('click', (e) => {
            if (userMenu && !userMenu.classList.contains('hidden') && !userMenuBtn.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
        mainAppListenersAttached = true;
        console.log("Eventos da aplicação principal configurados.");
    }

    function updateUI() {
        updateSummary();
        updateTransactionList();
        updateBudgetDisplay();
        updateCharts();
        renderRecurringRulesList();
    }

    function resetFormAndState() {
        editState = { active: false, transactionId: null };
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionDate').valueAsDate = new Date();
        document.getElementById('form-title').textContent = "Adicionar Transação";
        document.getElementById('submitBtn').textContent = "Adicionar Transação";
        document.getElementById('cancelBtn').classList.add("hidden");
        document.getElementById('installment-details').classList.add('hidden');
        document.getElementById('recurring-details').classList.add('hidden');
        document.getElementById('date-field-container').classList.remove('hidden');
        document.getElementById('isInstallment').disabled = false;
        document.getElementById('isRecurring').disabled = false;
        toggleCategoryFields();
    }

    function populateSelectors() {
        const typeSelect = document.getElementById("transactionType");
        const expenseCategorySelect = document.getElementById("transactionCategoryExpense");
        const incomeCategorySelect = document.getElementById("transactionCategoryIncome");
        typeSelect.innerHTML = '<option value="expense">Despesa</option><option value="income">Receita</option>';
        expenseCategorySelect.innerHTML = ''; incomeCategorySelect.innerHTML = '';
        categories.expense.forEach(cat => expenseCategorySelect.add(new Option(cat.text, cat.value)));
        categories.income.forEach(cat => incomeCategorySelect.add(new Option(cat.text, cat.value)));
        toggleCategoryFields();
    }

    function loadInitialTheme() {
        const isDark = localStorage.getItem("theme") === "dark";
        if (isDark) document.documentElement.classList.add("dark");
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            const textSpan = themeToggleBtn.querySelector('span');
            if (isDark) {
                icon.className = 'fas fa-sun w-5 h-5 mr-3';
                textSpan.textContent = 'Modo Claro';
            } else {
                icon.className = 'fas fa-moon w-5 h-5 mr-3';
                textSpan.textContent = 'Modo Escuro';
            }
        }
    }

    function updateTransactionList() {
        const transactionsList = document.getElementById("transactionsList");
        const activeFilter = document.querySelector('#filterAll.bg-primary, #filterIncome.bg-primary, #filterExpense.bg-primary')?.id.replace('filter', '').toLowerCase() || 'all';
        const term = document.getElementById('searchInput').value.toLowerCase();
        let filtered = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            if (viewMode === 'monthly') {
                return transactionDate.getUTCMonth() === currentDisplayDate.getMonth() && transactionDate.getUTCFullYear() === currentDisplayDate.getFullYear();
            } else {
                return transactionDate.getUTCFullYear() === currentDisplayDate.getFullYear();
            }
        });
        if (activeFilter !== 'all') filtered = filtered.filter(t => t.type === activeFilter);
        if (term) filtered = filtered.filter(t => t.description.toLowerCase().includes(term) || getCategoryName(t.category, t.type).toLowerCase().includes(term));
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        const totalPages = Math.ceil(filtered.length / transactionsPerPage);
        const paginatedTransactions = filtered.slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage);
        if (paginatedTransactions.length === 0) {
            transactionsList.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Nenhuma transação encontrada.</td></tr>';
        } else {
            let html = '';
            if (viewMode === 'yearly') {
                let lastMonth = -1;
                const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                paginatedTransactions.forEach(transaction => {
                    const transactionMonth = new Date(transaction.date).getUTCMonth();
                    if (transactionMonth !== lastMonth) {
                        html += `<tr class="bg-gray-100 dark:bg-gray-900 sticky top-0"><td colspan="5" class="px-6 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300">${monthNames[transactionMonth]}</td></tr>`;
                        lastMonth = transactionMonth;
                    }
                    html += renderTransactionRow(transaction);
                });
            } else {
                html = paginatedTransactions.map(renderTransactionRow).join('');
            }
            transactionsList.innerHTML = html;
        }
        renderPagination(totalPages, filtered.length);
    }

    function renderPagination(totalPages, totalItems) {
        const paginationContainer = document.getElementById('pagination-controls');
        if (totalItems <= transactionsPerPage) {
            paginationContainer.innerHTML = '';
            return;
        }
        let buttonsHtml = '';
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            buttonsHtml += `<button class="px-3 py-1 text-sm rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}" onclick="changePage(${i})" ${isActive ? 'disabled' : ''}>${i}</button>`;
        }
        paginationContainer.innerHTML = buttonsHtml;
    }

    window.changePage = function (page) { currentPage = page; updateTransactionList(); }

    function renderTransactionRow(transaction) {
        return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50"><td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center"><div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}"><i class="fas ${transaction.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></div><div class="ml-4"><div class="text-sm font-medium text-gray-900 dark:text-gray-200">${transaction.description}</div></div></div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-500 dark:text-gray-400 capitalize">${getCategoryName(transaction.category, transaction.type)}</div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-500 dark:text-gray-400">${formatDate(transaction.date)}</div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}</div></td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    <button onclick="startEditTransaction('${transaction._id}')" aria-label="Editar Transação" class="text-primary hover:text-indigo-700 mr-3">
        <i class="fas fa-edit"></i>
    </button>
    <button onclick="deleteTransaction('${transaction._id}')" aria-label="Deletar Transação" class="text-danger hover:text-red-800">
        <i class="fas fa-trash"></i>
    </button>
</td></tr>`;
    }

    async function deleteTransaction(id) {
  if (!confirm('Tem certeza que deseja excluir esta transação?')) {
    return;
  }

  try {
    const response = await fetch(`/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader() // Envia o token para autorização
    });

    if (!response.ok) {
      throw new Error('Falha ao deletar a transação.');
    }

    // Remove a transação da lista local para atualizar a tela instantaneamente
    transactions = transactions.filter(t => t._id !== id);
    updateUI(); // Atualiza a interface

    showAlert('Transação excluída com sucesso!', 'info');

  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    showAlert(error.message, 'error');
  }
}

    function updateSummary() {
        const currentMonth = currentDisplayDate.getMonth();
        const currentYear = currentDisplayDate.getFullYear();
        const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return viewMode === 'monthly' ? transactionDate.getUTCMonth() === currentMonth && transactionDate.getUTCFullYear() === currentYear : transactionDate.getUTCFullYear() === currentYear;
        });
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        document.getElementById('incomeAmount').textContent = formatCurrency(income);
        document.getElementById('expenseAmount').textContent = formatCurrency(expense);
        document.getElementById('balanceAmount').textContent = formatCurrency(income - expense);
    }

    function updateBudgetDisplay() {
        const currentMonth = currentDisplayDate.getMonth();
        const currentYear = currentDisplayDate.getFullYear();
        const monthlyExpense = transactions.filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
        }).reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget - monthlyExpense;
        const percentage = budget > 0 ? (monthlyExpense / budget) * 100 : 0;
        document.getElementById('monthlySpent').textContent = formatCurrency(monthlyExpense);
        document.getElementById('monthlyRemaining').textContent = formatCurrency(remaining > 0 ? remaining : 0) + (remaining < 0 ? ' (ultrapassado)' : '');
        const progressEl = document.getElementById('budgetProgress');
        progressEl.style.width = `${Math.min(100, percentage)}%`;
        progressEl.classList.remove('bg-primary', 'bg-warning', 'bg-danger');
        if (percentage > 100) progressEl.classList.add('bg-danger');
        else if (percentage > 80) progressEl.classList.add('bg-warning');
        else progressEl.classList.add('bg-primary');
    }

    function filterTransactions(filter) {
        ['All', 'Income', 'Expense'].forEach(btn => {
            const element = document.getElementById(`filter${btn}`);
            const isActive = btn.toLowerCase() === filter;
            element.classList.toggle("bg-primary", isActive); element.classList.toggle("text-white", isActive);
            element.classList.toggle("bg-gray-200", !isActive); element.classList.toggle("dark:bg-gray-700", !isActive);
            element.classList.toggle("text-gray-700", !isActive); element.classList.toggle("dark:text-gray-300", !isActive);
        });
        currentPage = 1;
        updateTransactionList();
    }

    function setViewMode(mode) {
        viewMode = mode;
        currentPage = 1;
        const monthlyBtn = document.getElementById('monthlyBtn');
        const yearlyBtn = document.getElementById('yearlyBtn');
        const monthSelect = document.getElementById('monthSelect');
        const activeClasses = ['bg-primary', 'text-white'];
        const inactiveClasses = ['bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300'];
        monthlyBtn.classList.remove(...activeClasses, ...inactiveClasses);
        yearlyBtn.classList.remove(...activeClasses, ...inactiveClasses);
        if (mode === 'monthly') {
            monthlyBtn.classList.add(...activeClasses);
            yearlyBtn.classList.add(...inactiveClasses);
            monthSelect.classList.remove('hidden');
        } else {
            yearlyBtn.classList.add(...activeClasses);
            monthlyBtn.classList.add(...inactiveClasses);
            monthSelect.classList.add('hidden');
        }
        updateUI();
    }

    function exportToCSV() {
        if (transactions.length === 0) return showAlert('Nenhuma transação para exportar.', 'warning');
        const headers = ["ID", "Tipo", "Categoria", "Descricao", "Valor", "Data"];
        const data = transactions.map(t => [t.id, t.type, getCategoryName(t.category, t.type), `"${t.description.replace(/"/g, '""')}"`, t.amount, t.date]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + data.map(row => row.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `fintrack_${currentUserEmail}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showAlert("Dados exportados com sucesso!", "success");
    }

    function toggleCategoryFields() {
        const isIncome = document.getElementById("transactionType").value === "income";
        document.getElementById("transactionCategoryExpense").classList.toggle("hidden", isIncome);
        document.getElementById("transactionCategoryIncome").classList.toggle("hidden", !isIncome);
        const installmentCheckboxContainer = document.getElementById("installment-checkbox-container");
        installmentCheckboxContainer.classList.toggle('hidden', isIncome);
        if (isIncome) document.getElementById('isInstallment').checked = false;
    }

    function showAlert(message, type) {
        const alertContainer = document.getElementById("alertContainer");
        const alert = document.createElement("div");
        const icons = { success: "fa-check-circle", error: "fa-exclamation-circle", warning: "fa-exclamation-triangle", info: "fa-info-circle" };
        const colors = { success: "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200", error: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200", warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200", info: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200" };
        alert.className = `alert-slide-in px-4 py-3 rounded-md shadow-md flex items-center ${colors[type] || colors.info}`;
        alert.innerHTML = `<i class="fas ${icons[type] || "fa-bell"} mr-2"></i><span>${message}</span>`;
        alertContainer.appendChild(alert);
        setTimeout(() => { alert.classList.replace("alert-slide-in", "alert-slide-out"); setTimeout(() => alert.remove(), 300); }, 3000);
    }

    function getCategoryName(categoryValue, type) {
        const categoryList = type === 'income' ? categories.income : categories.expense;
        const category = categoryList.find(c => c.value === categoryValue);
        return category ? category.text : categoryValue;
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        loadInitialTheme();
        updateCharts();
    }

    function formatCurrency(amount) { return "R$ " + Number(amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function formatDate(dateString) { if (!dateString) return "Data Inválida"; const date = new Date(dateString); return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString("pt-BR"); }
    function isDarkMode() { return document.documentElement.classList.contains("dark"); }
    
    function updateCharts() {
        const textColor = isDarkMode() ? "#F3F4F6" : "#1F2937";
        updateCategoryChart(textColor);
        updateAnnualChart(textColor);
    }

    function updateCategoryChart(textColor) {
        const ctx = document.getElementById("categoryChart")?.getContext("2d");
        if (!ctx) return;
        if (categoryChart) categoryChart.destroy();
        const categoryTotals = categories.expense.reduce((acc, category) => { acc[category.value] = 0; return acc; }, {});
        transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'expense' && (viewMode === 'monthly' ? transactionDate.getUTCMonth() === currentDisplayDate.getMonth() && transactionDate.getUTCFullYear() === currentDisplayDate.getFullYear() : transactionDate.getUTCFullYear() === currentDisplayDate.getFullYear());
        }).forEach(t => { if (categoryTotals.hasOwnProperty(t.category)) categoryTotals[t.category] += t.amount; });
        categoryChart = new Chart(ctx, {
            type: 'doughnut', data: {
                labels: Object.keys(categoryTotals).map(cat => getCategoryName(cat, 'expense')),
                datasets: [{ data: Object.values(categoryTotals), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8AC24A', '#F06292', '#795548'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 20 } }, title: { display: true, text: `Gastos por Categoria (${viewMode === 'monthly' ? 'Mensal' : 'Anual'})`, font: { size: 14 }, color: textColor } } }
        });
    }

    function updateAnnualChart(textColor) {
        const ctx = document.getElementById("annualChart")?.getContext("2d");
        if (!ctx) return;
        if (annualChart) annualChart.destroy();
        const currentYear = currentDisplayDate.getFullYear();
        const monthlyTotals = { income: Array(12).fill(0), expense: Array(12).fill(0) };
        transactions.filter(t => new Date(t.date).getUTCFullYear() === currentYear).forEach(t => {
            const month = new Date(t.date).getUTCMonth();
            if (t.type === 'income') monthlyTotals.income[month] += t.amount;
            else monthlyTotals.expense[month] += t.amount;
        });
        annualChart = new Chart(ctx, {
            type: 'bar', data: {
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
                datasets: [
                    { label: "Receitas", data: monthlyTotals.income, backgroundColor: 'rgba(79, 70, 229, 0.7)', borderRadius: 4 },
                    { label: "Despesas", data: monthlyTotals.expense, backgroundColor: 'rgba(239, 68, 68, 0.7)', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } }, title: { display: true, text: `Fluxo de Caixa em ${currentYear}`, font: { size: 14 }, color: textColor } },
                scales: {
                    y: { beginAtZero: true, ticks: { callback: value => "R$ " + value.toLocaleString("pt-BR"), color: textColor }, grid: { color: isDarkMode() ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" } },
                    x: { ticks: { color: textColor }, grid: { display: false } }
                }
            }
        });
    }

    async function fetchHolidays(year) {
        if (holidays[year]) return;
        try {
            const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
            if (!response.ok) throw new Error('API de feriados indisponível');
            const data = await response.json();
            holidays[year] = data.map(holiday => holiday.date);
        } catch (error) { console.error("Erro ao buscar feriados:", error); holidays[year] = []; }
    }

    async function getPreviousBusinessDay(date) {
        let adjustedDate = new Date(date.getTime());
        const year = adjustedDate.getUTCFullYear();
        if (!holidays[year]) await fetchHolidays(year);
        while (true) {
            const dayOfWeek = adjustedDate.getUTCDay();
            const dateString = adjustedDate.toISOString().split('T')[0];
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !(holidays[year] || []).includes(dateString)) break;
            adjustedDate.setUTCDate(adjustedDate.getUTCDate() - 1);
        }
        return adjustedDate;
    }

    async function generateRecurringTransactions(forceSave = false) {
        let anyGenerated = false;
        const today = new Date();
        const futureLimit = new Date();
        futureLimit.setFullYear(futureLimit.getFullYear() + 1);
        for (const rule of recurringTransactions) {
            let cursorDate = new Date(rule.createdAt || today);
            cursorDate.setUTCDate(1);
            while (cursorDate <= futureLimit) {
                const year = cursorDate.getUTCFullYear();
                const month = cursorDate.getUTCMonth();
                const alreadyExists = transactions.some(t => t.recurringRuleId === rule.id && new Date(t.date).getUTCFullYear() === year && new Date(t.date).getUTCMonth() === month);
                if (!alreadyExists) {
                    const day = rule.dayOfMonth > 28 ? new Date(Date.UTC(year, month + 1, 0)).getUTCDate() : rule.dayOfMonth;
                    const initialDate = new Date(Date.UTC(year, month, day));
                    const businessDay = await getPreviousBusinessDay(initialDate);
                    transactions.push({ id: Date.now() + Math.random(), type: rule.type, amount: rule.amount, description: `${rule.description} (Recorrente)`, date: businessDay.toISOString().split('T')[0], category: rule.category, isRecurring: true, recurringRuleId: rule.id });
                    anyGenerated = true;
                }
                cursorDate.setMonth(cursorDate.getMonth() + 1);
            }
        }
        if (anyGenerated || forceSave) {
            if (anyGenerated) showAlert('Transações recorrentes foram geradas/atualizadas.', 'info');
            saveDataForCurrentUser();
        }
    }

    function renderRecurringRulesList() {
        const listEl = document.getElementById('recurringRulesList');
        if (!listEl) return;
        listEl.innerHTML = recurringTransactions.length === 0 ? '<p class="text-gray-500 dark:text-gray-400 text-sm text-center">Nenhuma recorrência.</p>' :
            recurringTransactions.map(r => `<div class="flex justify-between items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50"><div><p class="font-medium text-dark dark:text-light text-sm">${r.description}</p><p class="text-xs text-gray-500 dark:text-gray-400"> ${formatCurrency(r.amount)} - Dia ${r.dayOfMonth} </p></div><button onclick="deleteRecurringRule(${r.id})" class="text-danger hover:text-red-800 text-sm px-2 py-1"><i class="fas fa-trash"></i></button></div>`).join('');
    }

    window.deleteRecurringRule = function (id) {
        if (confirm('Tem certeza que deseja excluir esta regra e TODAS as suas transações recorrentes (passadas e futuras)?')) {
            recurringTransactions = recurringTransactions.filter(r => r.id !== id);
            transactions = transactions.filter(t => t.recurringRuleId !== id);
            saveDataForCurrentUser();
            showAlert('Regra e todas as suas transações foram excluídas.', 'info');
            updateUI();
        }
    }

    
async function initializeApp() {
    // 1. A verificação agora é baseada no TOKEN, não mais no e-mail
    const token = localStorage.getItem('fintrack_token');

    if (token) {
        // Se existe um token, vamos validá-lo buscando os dados do usuário no backend
        try {
            // 2. Busca os dados do usuário na rota protegida /profile
            const profileResponse = await fetch('/profile', {
                headers: getAuthHeader() // getAuthHeader é a função que monta o cabeçalho com o token
            });

            // Se a resposta não for OK (ex: token expirado), causa um erro e desloga
            if (!profileResponse.ok) {
              throw new Error('Sessão inválida ou expirada.');
            }

            const userProfile = await profileResponse.json();

            // 3. Define as variáveis globais com os dados vindos do backend
            currentUserEmail = userProfile.email;
            currentUserName = userProfile.name;

            // 4. Atualiza a interface com os dados reais do usuário
            document.getElementById('user-name').textContent = currentUserName;
            document.getElementById('user-email-display').textContent = currentUserEmail;
            document.getElementById('menu-user-name').textContent = currentUserName;
            document.getElementById('menu-user-email').textContent = currentUserEmail;
            document.getElementById('user-avatar').innerHTML = `<i class="fas fa-user"></i>`; // Avatar padrão

            // Mostra a página principal e carrega o resto dos dados
            showPage('main-app');
            setupMainAppEventListeners(); // Garante que os botões da app principal funcionem
            await loadDataForCurrentUser(); // Carrega as transações do backend
            
            // Lógica restante que você já tinha
            loadInitialTheme();
            populateSelectors();
            updateMonthYearDisplay();
            setViewMode('monthly');

        } catch (e) {
            // Se o token for inválido, o fetch vai falhar.
            // Limpamos o token e mandamos para a tela de login.
            console.error(e);
            handleLogout(); // handleLogout deve limpar o localStorage e chamar initializeApp() de novo
        }
    } else {
        // Se não há token, mostra a tela de autenticação
        showPage('auth-container');
        setupAuthEventListeners();
        try {
            google.accounts.id.initialize({
                client_id: '154032121543-l562es7gcrp3242p53glh3d9s6g858g0.apps.googleusercontent.com',
                callback: handleGoogleSignIn
            });
            google.accounts.id.renderButton(document.getElementById('google-signin-btn-container'), { theme: 'outline', size: 'large' });
            google.accounts.id.renderButton(document.getElementById('google-signup-btn-container'), { theme: 'outline', size: 'large' });
        } catch (e) {
            console.error("Google Client ID não configurado ou erro na API.");
        }
        showScreenInAuth('login');
    }
}
    initializeApp();
});