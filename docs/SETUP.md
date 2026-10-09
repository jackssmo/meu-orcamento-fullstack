# Instalação e execução

## Pré-requisitos

- Node.js compatível com o projeto;
- npm;
- MySQL 8 ou compatível;
- Git.

## 1. Instalar dependências

Na raiz do projeto:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

## 2. Configurar o backend

Crie `backend/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=meu_orcamento
JWT_SECRET=uma_chave_longa_e_secreta
```

Nunca publique o `.env` nem use a chave JWT de desenvolvimento em produção.

Crie o banco no MySQL:

```sql
CREATE DATABASE meu_orcamento
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Execute as migrations:

```powershell
cd backend
npm run migrate
```

## 3. Configurar o frontend

Crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 4. Iniciar os serviços

Use dois terminais.

Backend:

```powershell
cd backend
npm run dev
```

Frontend:

```powershell
cd frontend
npm run dev
```

Abra `http://localhost:5173`.

## Problemas comuns

### API indisponível

Confirme se o backend está rodando na porta configurada e se `VITE_API_URL` aponta para `/api`.

### Erro de CORS

Em desenvolvimento, use `localhost` ou `127.0.0.1` na porta 5173 e mantenha essa origem em `FRONTEND_URL` quando necessário.

### Banco não atualizado

Execute `npm run migrate` dentro de `backend`.

