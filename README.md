# 🚀 Helpster: Sistema de Service Desk de TI

Bem-vindo ao repositório do **Helpster**! 👋

O Helpster é um sistema web (SaaS) eficiente, projetado para otimizar a gestão de tickets de suporte de TI. Ele permite que clientes abram, acompanhem e interajam com seus chamados, enquanto equipes de suporte podem gerenciar, escalar e resolver esses tickets de forma organizada e hierárquica.

---

## ✨ Funcionalidades Principais

O Helpster foi desenvolvido com foco em um Produto Mínimo Viável (MVP) robusto, incluindo as seguintes funcionalidades:

### 🎫 Gestão de Tickets
*   **Criação de Tickets:** Clientes e agentes podem abrir novos chamados com título, descrição, categoria e prioridade.
*   **Listagem de Tickets:**
    *   **Clientes:** Visualizam e acompanham apenas seus próprios tickets.
    *   **Agentes/Administradores:** Visualizam todos os tickets do sistema.
*   **Detalhes do Ticket:** Visualização completa do histórico do ticket, incluindo comentários.
*   **Atualização de Tickets:** Agentes e administradores podem alterar status, prioridade, nível de suporte e atribuir tickets.
*   **Comentários:** Adição de comentários públicos (visíveis para o cliente) e internos (apenas para a equipe de TI).

### 📚 Base de Conhecimento
*   **Criação e Edição de Artigos:** Administradores e gerentes podem criar, editar e deletar artigos utilizando Markdown.
*   **Upload de Imagens:** Suporte para upload de imagens diretamente nos artigos da Base de Conhecimento.
*   **Visualização de Artigos:** Todos os usuários autenticados podem consultar os artigos da Base de Conhecimento.

### 👥 Gestão de Usuários e Perfis (RBAC)
*   **Autenticação Segura:** Login de usuários com JWT.
*   **Gerenciamento de Usuários:** Administradores podem criar e listar usuários.
*   **Gerenciamento de Perfis (Roles):** Administradores podem criar e gerenciar perfis de acesso com permissões granulares.
*   **Autorização Baseada em Roles:** Rotas protegidas no backend e frontend garantem que apenas usuários com as permissões corretas acessem determinados recursos.

### 📧 Notificações por Email
*   **Atualizações de Ticket:** Clientes são notificados por email quando um agente atualiza seu ticket (comentário público ou mudança de status).
*   **Atribuição de Ticket:** Agentes são notificados por email quando um ticket é atribuído a eles.

---

## 💻 Tecnologias Utilizadas

### Backend (API)
*   **Node.js:** Ambiente de execução JavaScript.
*   **Express.js:** Framework web para Node.js.
*   **PostgreSQL:** Banco de dados relacional.
*   **`bcryptjs`:** Para hash de senhas.
*   **`jsonwebtoken`:** Para autenticação JWT.
*   **`multer`:** Para upload de arquivos (imagens da KB).
*   **`nodemailer`:** Para envio de emails.
*   **`express-async-handler`:** Para tratamento de erros em rotas assíncronas.
*   **`helmet`:** Para segurança da aplicação.
*   **`cors`:** Para lidar com requisições de diferentes origens.

### Frontend
*   **React:** Biblioteca JavaScript para construção de interfaces de usuário.
*   **Vite:** Ferramenta de build rápida para projetos web.
*   **Tailwind CSS:** Framework CSS utilitário para estilização rápida.
*   **`react-router-dom`:** Para roteamento na aplicação.
*   **`jwt-decode`:** Para decodificar tokens JWT no cliente.
*   **`react-markdown`:** Para renderizar conteúdo Markdown.
*   **`remark-gfm`:** Plugin para `react-markdown` para suporte a GitHub Flavored Markdown.
*   **`react-syntax-highlighter`:** Para destaque de sintaxe em blocos de código Markdown.

---

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o Helpster em sua máquina local.

### 1. Configuração do Backend (`api`)

1.  Navegue até o diretório da API:
    ```bash
    cd api
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo de variáveis de ambiente `.env` baseado no `.env.example`:
    ```bash
    cp .env.example .env
    ```
4.  Edite o arquivo `.env` com suas configurações de banco de dados PostgreSQL e credenciais de email. Exemplo:
    ```
    PORT=3000
    JWT_SECRET=SEU_SEGREDO_SUPER_SECRETO_E_LONGO
    DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/seu_banco_de_dados

    # Configurações de Email (para Nodemailer)
    EMAIL_HOST=smtp.ethereal.email
    EMAIL_PORT=587
    EMAIL_SECURE=false
    EMAIL_USER=seu_email@example.com
    EMAIL_PASS=sua_senha_email
    EMAIL_FROM="Helpster Support" <support@helpster.com>
    ```
    **Observação:** Certifique-se de ter uma instância do PostgreSQL rodando e que o banco de dados especificado exista. Para testar o envio de emails sem configurar um SMTP real, você pode usar o [Ethereal Email](https://ethereal.email/) para obter credenciais de teste.

5.  Execute o script de `seed` para popular o banco de dados com usuários, perfis, permissões e dados de exemplo:
    ```bash
    node seed.js
    ```
    **Importante:** Se você rodar o `seed.js` múltiplas vezes, ele limpará e recriará os dados, o que pode alterar os IDs dos usuários. Limpe o `localStorage` do seu navegador e faça login novamente após cada `seed`.

6.  Inicie o servidor da API:
    ```bash
    npm run dev
    ```
    A API estará rodando em `http://localhost:3000`.

### 2. Configuração do Frontend (`front`)

1.  Em um novo terminal, navegue até o diretório do frontend:
    ```bash
    cd front
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento do React:
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:5173` (ou a próxima porta disponível).

---

## 🔑 Credenciais de Login para Teste

Após executar o `node seed.js`, você pode usar as seguintes credenciais para testar a aplicação:

*   **Administrador:**
    *   **Email:** `admin@helpster.com`
    *   **Senha:** `password`
*   **Gerente:**
    *   **Email:** `manager@helpster.com`
    *   **Senha:** `password`
*   **Cliente:**
    *   **Email:** `client@helpster.com`
    *   **Senha:** `password`

---

## 💡 Próximos Passos e Melhorias Futuras

O Helpster é um MVP funcional, mas há muitas oportunidades para expansão e aprimoramento:

*   **Relatórios e Dashboards:** Implementar visualizações e métricas avançadas para o desempenho do service desk.
*   **Filtros Avançados de Tickets:** Adicionar mais opções de filtragem e persistência de visualização na listagem de tickets.
*   **Notificações em Tempo Real:** Integrar WebSockets para notificações instantâneas.
*   **Automações:** Criar regras para automação de tarefas (ex: fechar tickets inativos).
*   **Aplicativo Móvel:** Desenvolver versões móveis para clientes e agentes.
*   **Integrações:** Conectar com outras ferramentas (Slack, sistemas de CRM, etc.).

---

Agradecemos por explorar o Helpster! Se tiver alguma dúvida ou sugestão, sinta-se à vontade para contribuir.
