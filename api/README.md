> [!NOTE]
> Aqui é responsável por fornecer a API backend do nosso projeto
> inclui as rotas do site, os controladores e configurações do banco de dados

Exemplo componentes do projeto:
- **[`app.js`](./app.js)**: O ponto de entrada do servidor Express.

- **`controllers/`**: Contém os controladores, ainda apenas o [`auth.controller.js`](./controllers/auth.controller.js), que lidam com a lógica de autenticação.

- **`routes/`**: Contém as definições de rotas, como [`auth.route.js`](./routes/auth.route.js), [`home.route.js`](./routes/home.route.js) e [`user.route.js`](./routes/user.route.js).

- **`prisma/`**: Contém a configuração do Prisma, incluindo o arquivo [`schema.prisma`](./prisma/schema.prisma) para a definição do esquema do banco de dados.

- [**`teste_requisicao.http`**](./teste_requisicao.http): Contém exemplos de requisições HTTP para testar a API. É necessario baixar a extensão **REST Client** do VS Code pra isso.


----
Baixar extensões:
- **REST Client**: Para testar requisições HTTP diretamente do VS Code.
- **Prisma**: Para suporte ao Prisma no VS Code.
