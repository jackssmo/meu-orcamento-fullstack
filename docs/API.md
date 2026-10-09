# Referência da API

URL base local:

```text
http://localhost:3000/api
```

Rotas privadas exigem:

```http
Authorization: Bearer <token>
```

## Autenticação

### `POST /auth/register`

Cria uma conta.

```json
{
  "name": "Jackson",
  "email": "jackson@example.com",
  "password": "senha-segura"
}
```

### `POST /auth/login`

Autentica o usuário e retorna `token` e `user`.

### `GET /auth/profile`

Retorna os dados do usuário autenticado sem a senha.

### `PUT /auth/profile`

Atualiza nome, e-mail e opcionalmente a senha.

```json
{
  "name": "Jackson",
  "email": "jackson@example.com",
  "currentPassword": "senha-atual",
  "newPassword": "nova-senha"
}
```

## Transações

### `POST /transactions`

Cria uma receita ou despesa.

```json
{
  "description": "Salário",
  "amount": 3500,
  "type": "income",
  "category": "salario",
  "date": "2026-10-30",
  "is_fixed": true,
  "installments": 1
}
```

`is_fixed` é usado para receitas recorrentes. Para despesas parceladas, use `installments` maior que 1.

### `GET /transactions`

Parâmetros opcionais:

- `month`: 1 a 12;
- `year`;
- `search`;
- `type`: `income` ou `expense`;
- `page`;
- `pageSize`.

Resposta:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### `GET /transactions/summary`

Recebe `month` e `year` e retorna receitas, despesas, saldo e saldo realizado.

### `PUT /transactions/:id`

Edita descrição, valor, tipo, categoria e data da transação.

### `DELETE /transactions/:id`

Exclui uma transação. Se for uma receita fixa, remove também as ocorrências futuras da mesma série a partir da ocorrência selecionada.

## Relatórios

### `GET /financial/reports/monthly?year=2026`

Retorna totais mensais do ano.

### `GET /financial/reports/monthly?month=10&year=2026`

Retorna gastos por categoria e totais diários do mês.

## Recursos financeiros auxiliares

Rotas autenticadas disponíveis para `accounts`, `categories`, `budgets` e `goals`:

```text
GET    /financial/:resource
POST   /financial/:resource
PATCH  /financial/:resource/:id
DELETE /financial/:resource/:id
```

Os recursos aceitos e seus campos são validados por Zod no backend.

