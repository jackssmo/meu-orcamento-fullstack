# 💰 Meu Orçamento (Financial Tracker)

Um sistema completo (Full-Stack) de gestão financeira pessoal construído com foco em arquitetura escalável, segurança e usabilidade. A aplicação permite aos utilizadores registar receitas e despesas, visualizar resumos mensais e gerir o seu dinheiro de forma inteligente.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando uma arquitetura moderna de Monorepo, separando responsabilidades entre Frontend e Backend, ambos com tipagem estrita (TypeScript).

### Frontend (Interface Gráfica)
* **React** (com **Vite** para compilação super rápida)
* **TypeScript** (Tipagem forte para prevenção de bugs)
* **Tailwind CSS** (Estilização responsiva e moderna)
* **Axios** (Comunicação com a API com intercetores de Token JWT)
* **React Router DOM** (Navegação SPA - Single Page Application)
* **React Hot Toast** (Feedback visual e notificações)

### Backend (API e Servidor)
* **Node.js** com **Express**
* **TypeScript** (Interfaces e tipagem de Payloads)
* **MongoDB Atlas** (Base de dados NoSQL na nuvem)
* **Mongoose** (ODM para modelagem de dados)
* **JWT (JSON Web Tokens)** (Autenticação *stateless* e segura)
* **Bcrypt** (Criptografia de palavras-passe)

---

## 🌟 Funcionalidades

* **Autenticação Segura:** Registo e Login de utilizadores com encriptação de senhas e proteção de rotas com JWT.
* **Dashboard Interativo:** Resumo financeiro dinâmico com cálculo automático de Receitas, Despesas e Saldo atual.
* **Gestão de Transações (CRUD):** Criação, leitura, edição e eliminação de transações financeiras.
* **Filtros Avançados:** Filtragem de transações por Mês e Ano.
* **Análise Visual:** Barra de progresso visual mostrando as despesas divididas por categorias (Alimentação, Moradia, etc.).
* **Design Responsivo:** Interface "Mobile-First" que se adapta perfeitamente a smartphones, tablets e desktops.

---

## 🧠 Arquitetura e Boas Práticas (Padrão Ouro)

Este projeto foi desenvolvido seguindo as melhores práticas da indústria de software:

1. **Design Pattern MVC & SOLID (Backend):** Separação clara entre `Models` (Dados), `Controllers` (Lógica de Negócio) e `Routes` (Roteamento). Middlewares isolados para validação de Autenticação.
2. **Componentização Inteligente (Frontend):** O React foi estruturado utilizando o padrão de *Smart* e *Dumb Components*. A página principal foi fatiada em componentes menores e reutilizáveis (`Header`, `SummaryCards`, `TransactionTable`, `TransactionModal`), garantindo o Princípio da Responsabilidade Única.
3. **Segurança Avançada:** Validação de duplicidade de e-mails, proteção contra CORS e endpoints (rotas) protegidos contra acesso não autorizado.
4. **Variáveis de Ambiente Dinâmicas:** Separação de credenciais, chaves secretas e URLs utilizando ficheiros `.env` isolados em ambos os ambientes, garantindo a segurança dos dados em produção.

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de que tem o [Node.js](https://nodejs.org/) e o [Git](https://git-scm.com/) instalados na sua máquina. Precisará também de uma ligação válida ao MongoDB (Atlas na nuvem ou localmente).

### 1. Clonar o Repositório
```bash
git clone https://github.com/seuusuario/repositorio.git
cd meu-orcamento-fullstack
```

### 2. Configurar e Executar o Backend
Abra um terminal e aceda à pasta do backend:
```bash
cd backend
npm install
```

Crie um ficheiro `.env` na raiz da pasta `backend/` com as seguintes variáveis:
```env
PORT=3000
MONGO_URI=sua_string_de_conexao_do_mongodb_aqui
JWT_SECRET=sua_chave_secreta_jwt_aqui
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O backend estará a rodar em `http://localhost:3000`

### 3. Configurar e Executar o Frontend
Abra **outro** terminal e aceda à pasta do frontend:
```bash
cd frontend
npm install
```

Crie um ficheiro `.env` na raiz da pasta `frontend/` com o endereço onde a API está a correr:
```env
VITE_API_URL=http://localhost:3000
```

Inicie a aplicação React:
```bash
npm run dev
```

Abra o seu navegador no link fornecido pelo Vite (geralmente `http://localhost:5173`) para aceder ao sistema!

---

## 👨‍💻 Autor

**Jackson**
*Desenvolvedor Full-Stack*

Projeto pessoal desenvolvido com foco em qualidade de código, arquitetura escalável e experiência do utilizador.