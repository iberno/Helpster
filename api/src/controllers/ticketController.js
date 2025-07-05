const asyncHandler = require('express-async-handler');
const { pool } = require('../config/database');
const { sendTicketUpdateEmail, sendTicketAssignedEmail } = require('../services/emailService');

// @desc    Criar um novo ticket
// @route   POST /api/tickets
// @access  Privado (Cliente, Agente, Admin)
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category_id, priority } = req.body;
  const client_id = req.user.id; // O ID do usuário logado

  if (!title || !description || !category_id) {
    res.status(400);
    throw new Error('Título, descrição e categoria são obrigatórios.');
  }

  const { rows } = await pool.query(
    'INSERT INTO tickets (title, description, client_id, category_id, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, description, client_id, category_id, priority || 'Média']
  );

  res.status(201).json(rows[0]);
});

// @desc    Listar todos os tickets (para Admins e Agentes)
// @route   GET /api/tickets
// @access  Privado (Admin, Agente)
const getAllTickets = asyncHandler(async (req, res) => {
  // Query mais completa para trazer informações úteis na listagem
  const query = `
    SELECT 
      t.id, t.title, t.status, t.priority, t.support_level, t.created_at,
      c.name as category_name,
      u_client.name as client_name,
      u_agent.name as agent_name
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    JOIN users u_client ON t.client_id = u_client.id
    LEFT JOIN users u_agent ON t.agent_id = u_agent.id
    ORDER BY t.created_at DESC
  `;
  const { rows } = await pool.query(query);
  res.status(200).json(rows);
});

// @desc    Listar os tickets do próprio usuário
// @route   GET /api/tickets/mytickets
// @access  Privado (Cliente)
const getMyTickets = asyncHandler(async (req, res) => {
  const client_id = req.user.id;
  const { rows } = await pool.query('SELECT * FROM tickets WHERE client_id = $1 ORDER BY created_at DESC', [client_id]);
  res.status(200).json(rows);
});

// @desc    Obter um ticket por ID com comentários
// @route   GET /api/tickets/:id
// @access  Privado
const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Pega os detalhes do ticket
  const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);

  if (ticketResult.rows.length === 0) {
    res.status(404);
    throw new Error('Ticket não encontrado.');
  }

  const ticket = ticketResult.rows[0];

  // Verifica a permissão: Admin/Agente pode ver qualquer ticket, cliente só pode ver o seu.
  if (user.role === 'user' && ticket.client_id !== user.id) {
    res.status(403);
    throw new Error('Acesso negado. Você não tem permissão para ver este ticket.');
  }

  // Pega os comentários associados
  const commentsQuery = `
    SELECT 
      com.*,
      u.name as author_name
    FROM comments com
    JOIN users u ON com.author_id = u.id
    WHERE com.ticket_id = $1
    ORDER BY com.created_at ASC
  `;
  const commentsResult = await pool.query(commentsQuery, [id]);

  res.status(200).json({ ...ticket, comments: commentsResult.rows });
});

// @desc    Atualizar um ticket (status, prioridade, agente, etc.)
// @route   PUT /api/tickets/:id
// @access  Privado (Admin, Agente)
const updateTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, priority, support_level, agent_id } = req.body;

  console.log('updateTicket: req.body', req.body); // Log do corpo da requisição

  const oldTicketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
  const oldTicket = oldTicketResult.rows[0];

  console.log('updateTicket: oldTicket from DB', oldTicket); // Log do ticket antigo do DB

  if (!oldTicket) {
    res.status(404);
    throw new Error('Ticket não encontrado.');
  }

  // Prepara os valores para a query de atualização, garantindo fallbacks
  const newStatus = status !== undefined ? status : oldTicket.status;
  const newPriority = priority !== undefined ? priority : oldTicket.priority;
  const newSupportLevel = support_level !== undefined ? support_level : oldTicket.support_level;
  const newAgentId = agent_id !== undefined ? agent_id : oldTicket.agent_id; // Usa old agent_id se não fornecido

  console.log('updateTicket: Values for query:', { newStatus, newPriority, newSupportLevel, newAgentId }); // Log dos valores antes da query

  const { rows } = await pool.query(
    'UPDATE tickets SET status = $1, priority = $2, support_level = $3, agent_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
    [newStatus, newPriority, newSupportLevel, newAgentId, id]
  );

  const updatedTicket = rows[0];

  // Enviar email se o status ou prioridade mudou
  if (oldTicket.status !== updatedTicket.status || oldTicket.priority !== updatedTicket.priority) {
    const clientUserResult = await pool.query('SELECT email FROM users WHERE id = $1', [updatedTicket.client_id]);
    const clientEmail = clientUserResult.rows[0]?.email;
    if (clientEmail) {
      sendTicketUpdateEmail(
        clientEmail,
        updatedTicket.id,
        updatedTicket.title,
        `O status do seu ticket foi alterado para <strong>${updatedTicket.status}</strong> e a prioridade para <strong>${updatedTicket.priority}</strong>.`
      );
    }
  }

  // Enviar email se o agente foi atribuído ou alterado
  if (agent_id && oldTicket.agent_id !== agent_id) {
    const agentUserResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [agent_id]);
    const agentEmail = agentUserResult.rows[0]?.email;
    const agentName = agentUserResult.rows[0]?.name;
    if (agentEmail) {
      sendTicketAssignedEmail(
        agentEmail,
        updatedTicket.id,
        updatedTicket.title,
        agentName
      );
    }
  }

  res.status(200).json(updatedTicket);
});

// @desc    Adicionar um comentário a um ticket
// @route   POST /api/tickets/:id/comments
// @access  Privado
const addCommentToTicket = asyncHandler(async (req, res) => {
  const { id } = req.params; // ID do ticket
  const { content, visibility } = req.body;
  const author_id = req.user.id;

  console.log('addCommentToTicket: Ticket ID:', id);
  console.log('addCommentToTicket: Content:', content);
  console.log('addCommentToTicket: Visibility:', visibility);
  console.log('addCommentToTicket: Author ID:', author_id);

  // TODO: Adicionar lógica de permissão mais granular aqui

  const { rows } = await pool.query(
    'INSERT INTO comments (content, visibility, ticket_id, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [content, visibility || 'Público', id, author_id]
  );

  const newComment = rows[0];

  // Se o comentário for público, notificar o cliente do ticket
  if (newComment.visibility === 'Público') {
    const ticketResult = await pool.query('SELECT title, client_id FROM tickets WHERE id = $1', [id]);
    const ticket = ticketResult.rows[0];
    if (ticket) {
      const clientUserResult = await pool.query('SELECT email FROM users WHERE id = $1', [ticket.client_id]);
      const clientEmail = clientUserResult.rows[0]?.email;
      if (clientEmail) {
        sendTicketUpdateEmail(
          clientEmail,
          ticket.id,
          ticket.title,
          `Um novo comentário público foi adicionado ao seu ticket: <br/><br/><em>\"${newComment.content}\"</em>`
        );
      }
    }
  }

  res.status(201).json(newComment);
});

module.exports = {
  createTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  updateTicket,
  addCommentToTicket,
};
