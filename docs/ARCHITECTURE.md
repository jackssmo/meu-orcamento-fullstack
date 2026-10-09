# Arquitetura

## Visão geral

O projeto usa uma arquitetura separada em frontend e backend:

```text
React + Vite + Tailwind
          |
        Axios
          |
Express + TypeScript
          |
      MySQL
```

## Frontend

O frontend está em `frontend/` e usa:

- React;
- TypeScript;
- React Router;
- Axios;
- Tailwind CSS;
- Vite.

As páginas protegidas são renderizadas dentro de `ProtectedRoute`. O token JWT é armazenado no `localStorage` e enviado pelo interceptor do Axios.

O `Dashboard` coordena o período selecionado, transações, resumo, relatórios e modal de lançamento. Componentes visuais como `SummaryCards`, `TransactionTable` e `TransactionModal` ficam separados para facilitar manutenção.

## Backend

O backend está em `backend/` e segue o fluxo:

```text
Route -> Controller -> Service -> Repository -> MySQL
```

- **Route:** registra endpoints e middleware.
- **Controller:** interpreta a requisição e produz a resposta HTTP.
- **Service:** aplica regras como parcelas, recorrência e autorização.
- **Repository:** executa queries parametrizadas.
- **Validator:** valida dados de entrada com Zod.

## Autenticação

1. O usuário cria uma conta.
2. A senha é armazenada com hash bcrypt.
3. O login gera um JWT.
4. O frontend envia `Authorization: Bearer <token>`.
5. O middleware valida o token e associa o `user_id` à requisição.
6. Queries financeiras filtram pelo usuário autenticado.

## Recorrência e parcelamento

Parcelamentos dividem o valor em centavos antes da persistência, evitando perda por ponto flutuante.

Receitas fixas geram 12 ocorrências. A data mensal é calculada por `recurrenceDate.ts` para:

- respeitar o último dia útil;
- evitar que 30 ou 31 de um mês avance para o mês seguinte;
- limitar datas comuns ao último dia disponível do mês.

## Banco e migrations

As migrations SQL ficam em `backend/migrations/`. O comando `npm run migrate` cria a tabela `schema_migrations`, executa arquivos em ordem alfabética e registra os arquivos aplicados.

Não remova registros de `schema_migrations` em um banco com dados reais sem um plano de migração e backup.

## Segurança

- Senhas com bcrypt;
- JWT obrigatório nas rotas privadas;
- autorização por usuário;
- queries com parâmetros;
- CORS configurado por origem;
- rate limit global;
- validação com Zod;
- middleware global de erros.

