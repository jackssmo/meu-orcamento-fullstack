# User Stories - Meu Orçamento

## Épico 1: Autenticação e Segurança

**US01 - Cadastro e Autenticação de Usuário**
* **História:** Como usuário, quero me cadastrar no sistema criando um login com senha, para que eu tenha segurança com minhas informações e meus dados fiquem privados.
* **Critérios de Aceitação:**
  * **Cenário 1: Cadastro realizado com sucesso (Caminho Feliz)**
    * **Dado que** o usuário está na tela de cadastro
    * **Quando** ele preenche um e-mail não cadastrado e uma senha válida
    * **E** clica em "Cadastrar"
    * **Então** o sistema deve criar a conta e redirecioná-lo para a tela de login.
  * **Cenário 2: Tentativa de cadastro com e-mail já existente (Caminho Triste)**
    * **Dado que** o usuário está na tela de cadastro
    * **Quando** ele informa um e-mail que já possui conta no sistema
    * **Então** o sistema deve impedir o cadastro
    * **E** exibir a mensagem de erro "Este e-mail já está em uso".

---

## Épico 2: Gestão de Entradas e Saídas

**US02 - Registro de Despesas (Saídas)**
* **História:** Como usuário do sistema, quero cadastrar uma despesa informando valor, data, categoria e se é parcelada, para que eu possa acompanhar meus gastos mensais e anuais.
* **Critérios de Aceitação:**
  * **Cenário 1: Despesa parcelada registrada com sucesso**
    * **Dado que** o usuário logado está no formulário de nova transação
    * **Quando** ele preenche uma despesa de R$ 300,00, marca a opção "Parcelado" e informa "3 parcelas"
    * **Então** o sistema deve registrar 3 saídas de R$ 100,00 nos meses subsequentes.
  * **Cenário 2: Submissão sem campos obrigatórios (Caminho Triste)**
    * **Dado que** o usuário está no formulário de nova despesa
    * **Quando** ele tenta salvar a transação deixando o campo "Valor" vazio
    * **Então** o sistema não deve salvar no banco de dados
    * **E** deve destacar o campo em vermelho com o alerta "O valor é obrigatório".

**US03 - Registro de Rendas (Entradas)**
* **História:** Como usuário do sistema, quero cadastrar minha renda informando valor, data, categoria e se é fixa, para que eu possa acompanhar meus ganhos mensais e anuais.
* **Critérios de Aceitação:**
  * **Cenário 1: Renda fixa cadastrada com sucesso**
    * **Dado que** o usuário está cadastrando uma nova entrada
    * **Quando** ele insere o valor do seu salário e marca a opção "Renda Fixa"
    * **Então** o sistema deve salvar a entrada para o mês atual
    * **E** projetar automaticamente esse mesmo valor de entrada para os meses futuros.
  * **Cenário 2: Tentativa de cadastrar renda com valor negativo ou zerado (Caminho Triste)**
    * **Dado que** o usuário está no formulário de nova renda
    * **Quando** ele informa o valor "R$ 0,00" ou "-50,00"
    * **Então** o botão de salvar deve ser desabilitado
    * **E** o sistema deve exibir a mensagem "O valor de uma renda deve ser maior que zero".

---

## Épico 3: Acompanhamento e Relatórios

**US04 - Visualização do Dashboard**
* **História:** Como usuário do sistema, quero visualizar um painel com o resumo das minhas despesas e rendas, para que eu possa acompanhar o saldo atual e os totais mensais.
* **Critérios de Aceitação:**
  * **Cenário 1: Visualização padrão de um mês com dados**
    * **Dado que** o usuário possui R$ 5.000 de renda e R$ 2.000 de despesas cadastradas no mês atual
    * **Quando** ele acessa o Dashboard
    * **Então** o painel deve exibir "Entradas: R$ 5.000", "Saídas: R$ 2.000" e "Saldo: R$ 3.000".
  * **Cenário 2: Visualização de conta recém-criada (Caminho Alternativo)**
    * **Dado que** o usuário é novo e não possui transações
    * **Quando** ele acessa o Dashboard
    * **Então** os cartões de resumo devem exibir valores zerados ("R$ 0,00")
    * **E** o sistema deve mostrar uma mensagem amigável convidando-o a registrar sua primeira transação.