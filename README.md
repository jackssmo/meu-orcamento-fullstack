# 💰 Meu Orçamento Fullstack

Uma aplicação web completa para gestão de orçamento pessoal, permitindo que você acompanhe suas receitas e despesas de forma simples e intuitiva.

## 🎯 Sobre o Projeto

**Meu Orçamento** é uma aplicação fullstack moderna que ajuda você a:
- ✅ Registrar receitas e despesas
- ✅ Categorizar suas transações
- ✅ Visualizar um dashboard com resumo financeiro
- ✅ Gerenciar sua conta pessoal com autenticação segura

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **TypeScript** para type safety
- **MongoDB** com Mongoose para persistência de dados
- **JWT** para autenticação segura
- **bcrypt** para criptografia de senhas
- **CORS** para comunicação entre frontend e backend

### Frontend
- **React 19** com TypeScript
- **Vite** para build rápido e HMR
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Axios** para requisições HTTP
- **React Hot Toast** para notificações

## 📋 Requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js** (v16 ou superior)
- **npm** ou **yarn**
- **MongoDB** (local ou Atlas)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd meu-orcamento-fullstack
```

### 2. Instale as dependências do Backend

```bash
cd backend
npm install
```

### 3. Instale as dependências do Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### Backend (.env)

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```env
# Servidor
PORT=3000

# Banco de dados
MONGODB_URI=mongodb://localhost:27017/meu-orcamento
# Ou use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/meu-orcamento

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=7d

# Node
NODE_ENV=development
```

### Frontend (.env)

Crie um arquivo `.env` na pasta `frontend`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 📁 Estrutura do Projeto

```
meu-orcamento-fullstack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # Configuração do MongoDB
│   │   ├── controllers/
│   │   │   ├── authController.ts  # Lógica de autenticação
│   │   │   └── transactionController.ts  # Lógica de transações
│   │   ├── middleware/
│   │   │   └── auth.ts            # Middleware de autenticação
│   │   ├── models/
│   │   │   ├── User.ts            # Modelo de usuário
│   │   │   └── Transaction.ts     # Modelo de transação
│   │   ├── routes/
│   │   │   ├── authRoutes.ts      # Rotas de autenticação
│   │   │   └── transactionRoutes.ts  # Rotas de transações
│   │   └── server.ts              # Ponto de entrada
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx          # Página de login
│   │   │   ├── Register.tsx       # Página de registro
│   │   │   └── Dashboard.tsx      # Dashboard principal
│   │   ├── services/
│   │   │   └── api.ts             # Configuração do Axios
│   │   ├── App.tsx                # Componente raiz
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Estilos globais
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

## 🎮 Rodando a Aplicação

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📚 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login

### Transações
- `GET /api/transactions` - Listar transações do usuário autenticado
- `POST /api/transactions` - Criar nova transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Deletar transação

## 🔐 Fluxo de Autenticação

1. Usuário se registra com email e senha
2. Senha é criptografada com bcrypt
3. Após login, um token JWT é gerado
4. Token é armazenado no cliente e enviado em cada requisição
5. Middleware valida o token antes de acessar rotas protegidas

## 🏗️ Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Melhorias Futuras

- [ ] Adicionar gráficos e relatórios financeiros
- [ ] Implementar filtros por data e categoria
- [ ] Adicionar exportação de dados (CSV/PDF)
- [ ] Integração com plataformas de pagamento
- [ ] Aplicativo mobile com React Native
- [ ] Testes automatizados (Jest, Vitest)

## 📄 Licença

Este projeto está sob a licença ISC.

## 👤 Autor

Desenvolvido com ❤️

---

**Dúvidas?** Abra uma issue ou entre em contato!
