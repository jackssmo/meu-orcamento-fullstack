# Documentação do Meu Orçamento

O **Meu Orçamento** é um sistema pessoal de controle financeiro. Ele permite registrar receitas e despesas, acompanhar o saldo mensal, visualizar a evolução anual e analisar os gastos por categoria.

> O projeto foi pensado para uso individual. O banco possui `user_id` em todos os dados financeiros para manter a separação e a segurança dos lançamentos.

## Índice

- [Visão geral da arquitetura](./ARCHITECTURE.md)
- [Instalação e execução](./SETUP.md)
- [Configuração para vários dispositivos](./DEPLOYMENT.md)
- [Referência da API](./API.md)
- [Guia de uso](./USER_GUIDE.md)
- [Histórias de usuário](./USER_STORIES.md)
- [Diagrama de classes](./modelagem/DIAGRAMA_DE_CLASSES.md)

## Funcionalidades atuais

- Cadastro e login com JWT.
- Alteração de nome, e-mail e senha.
- Receitas e despesas com data, categoria e valor.
- Data atual preenchida automaticamente em novos lançamentos.
- Edição e exclusão de transações.
- Despesas parceladas com distribuição correta de centavos.
- Receitas fixas projetadas por 12 meses.
- Ajuste de receitas recorrentes para o último dia útil do mês.
- Exclusão dos lançamentos futuros de uma receita fixa.
- Busca, filtro por tipo e paginação.
- Cards de receitas, despesas e saldo.
- Evolução anual com seleção do mês por toque/clique.
- Gráfico de gastos por categoria com cores estáveis.
- Categorias padrão e categorias personalizadas.
- Interface responsiva para desktop e celular.

## Estrutura do repositório

```text
backend/
  migrations/       Scripts versionados do MySQL
  src/
    config/          Ambiente e conexão com banco
    controllers/     Entrada HTTP
    middleware/      Autenticação, erros e 404
    models/          Tipos de domínio
    repositories/    Persistência no MySQL
    routes/          Rotas Express
    scripts/         Comandos administrativos
    services/        Regras de negócio
    utils/           Funções reutilizáveis e testes
    validators/      Schemas Zod
frontend/
  public/            Arquivos públicos e favicon
  src/
    components/      Componentes reutilizáveis
    pages/           Login, cadastro, dashboard e perfil
    services/        Cliente HTTP
    types/           Tipos TypeScript
    utils/            Formatadores
docs/                Documentação do projeto
```

## Decisões de escopo

O projeto atualmente não inclui cartões, integração bancária, transferências, múltiplas moedas, anexos ou notificações. Essas funcionalidades podem ser adicionadas no futuro sem alterar o fluxo principal.

