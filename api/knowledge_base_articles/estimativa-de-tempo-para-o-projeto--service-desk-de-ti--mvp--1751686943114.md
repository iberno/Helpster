
Este documento descreve a estimativa de tempo para o desenvolvimento do Produto Mínimo Viável (MVP) do sistema de Service Desk.

**Estimativa Total:** 3 a 5 semanas.

---
![Screenshot 2025-07-05 at 00-41-04 Vite React.png](http://localhost:3000/public/uploads/kb_images/image-1751686883328.png)

---

### **Fase 1: Construção do Backend e da Base de Dados (1.5 a 2 semanas)**

O objetivo desta fase é criar a fundação sólida da API e do banco de dados que sustentarão a aplicação.

*   **Semana 1: Estrutura do Banco e APIs Essenciais**
    *   **Banco de Dados:** Finalizar e executar os scripts para criar todas as tabelas (`tickets`, `categories`, `comments`, `roles`, `permissions`, etc.).
    *   **API de Tickets:** Implementar os endpoints para `criar`, `listar` e `visualizar` um ticket.
    *   **API de Categorias:** Implementar os endpoints para o CRUD (Criar, Ler, Atualizar, Deletar) de categorias.
    *   **Lógica de Permissão:** Implementar a verificação de permissões a nível de rota na API (ex: `tickets:create`), garantindo que a autorização seja granular.

*   **Semana 2 (primeira metade): APIs de Gerenciamento e Lógica de Negócio**
    *   **API de Usuários e Perfis:** Conectar o painel de administração do frontend aos endpoints reais da API para gerenciar usuários e perfis.
    *   **Lógica de Atribuição:** Implementar a funcionalidade de negócio para direcionar e redirecionar tickets entre agentes e níveis de suporte.

**Marco ao final da Fase 1:** Uma API robusta e segura, pronta para ser consumida pelo frontend, com a estrutura de dados completamente definida.

---

### **Fase 2: Conexão do Frontend e Desenvolvimento das Telas (1.5 a 2 semanas)**

O objetivo desta fase é construir a interface do usuário e conectá-la 100% à API do backend.

*   **Semana 2 (segunda metade): Conexão e Telas de Admin**
    *   **Remover Dados Simulados (Mocks):** Substituir todas as chamadas simuladas no `authService.js` do frontend por chamadas reais à nossa nova API.
    *   **Conectar Painel Admin:** Garantir que as telas de gerenciamento de usuários e perfis funcionem perfeitamente com o backend.

*   **Semana 3: Fluxo Principal de Tickets**
    *   **Dashboard do Agente:** Desenvolver a tela principal para os agentes, com as filas de tickets ("Não Atribuídos", "Meus Tickets").
    *   **Página de Detalhes do Ticket:** Criar a interface onde a interação com o ticket acontece (adicionar comentários públicos/internos, mudar status, redirecionar).
    *   **Telas do Cliente:** Desenvolver as telas para o cliente final criar e acompanhar o andamento de seus tickets.

**Marco ao final da Fase 2:** Aplicação funcional de ponta a ponta. O fluxo principal de criação, atribuição e resolução de tickets estará completo e operacional.

---

### **Fase 3: Integração, Testes e Polimento (1 semana)**

O objetivo desta fase é garantir a qualidade, a estabilidade e a usabilidade do produto final.

*   **Semana 4/5:**
    *   **Notificações por Email:** Integrar um serviço de terceiros (como SendGrid, Mailgun, etc.) para o envio de emails transacionais.
    *   **Testes End-to-End:** Realizar testes completos dos fluxos de usuário (cliente, agente, admin) para garantir que o sistema se comporte como esperado.
    *   **Refinamento e Correção de Bugs:** Ajustar detalhes da interface (UI/UX), melhorar a performance e corrigir quaisquer problemas encontrados durante a fase de testes.

**Marco Final:** Um MVP estável, testado e pronto para ser apresentado a um cliente para validação e feedback.