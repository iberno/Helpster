const asyncHandler = require('express-async-handler');
const { pool } = require('../config/database');
const { sendTicketUpdateEmail, sendTicketAssignedEmail } = require('../services/emailService');

// @desc    Criar um novo ticket
// @route   POST /api/tickets
// @access  Privado (Cliente, Agente, Admin)
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category_id, priority_name, support_level_name } = req.body;
  const client_id = req.user.id; // O ID do usuário logado

  if (!title || !description || !category_id) {
    res.status(400);
    throw new Error('Título, descrição e categoria são obrigatórios.');
  }

  // Obter IDs padrão para status, prioridade e nível de suporte
  const defaultStatus = await pool.query('SELECT id FROM ticket_statuses WHERE name = $1', ['Aberto']);
  const defaultPriority = await pool.query('SELECT id FROM ticket_priorities WHERE name = $1', [priority_name || 'Média']);
  const defaultServiceLevel = await pool.query('SELECT id FROM service_levels WHERE name = $1', [support_level_name || 'N1']);

  const status_id = defaultStatus.rows[0].id;
  const priority_id = defaultPriority.rows[0].id;
  const service_level_id = defaultServiceLevel.rows[0].id;

  const { rows } = await pool.query(
    'INSERT INTO tickets (title, description, client_id, category_id, status_id, priority_id, service_level_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [title, description, client_id, category_id, status_id, priority_id, service_level_id]
  );

  res.status(201).json(rows[0]);
});

// @desc    Listar todos os tickets (para Admins e Agentes)
// @route   GET /api/tickets
// @access  Privado (Admin, Agente)
const getAllTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', sortField = 'created_at', sortOrder = 'desc' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const whereClauses = [];
  const queryParams = [];
  let currentParamIndex = 1;

  if (search) {
    whereClauses.push(`(t.title ILIKE $${currentParamIndex} OR t.description ILIKE $${currentParamIndex})`);
    queryParams.push(`%${search}%`);
    currentParamIndex++;
  }

  const validSortFields = [
    'id', 'title', 'status_name', 'priority_name',
    'service_level_name', 'created_at', 'category_name',
    'client_name', 'agent_name'
  ];
  const orderByField = validSortFields.includes(sortField) ? sortField : 'created_at';
  const orderByOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const baseQuery = `
    FROM tickets t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u_client ON t.client_id = u_client.id
    LEFT JOIN users u_agent ON t.agent_id = u_agent.id
    LEFT JOIN ticket_statuses ts ON t.status_id = ts.id
    LEFT JOIN ticket_priorities tp ON t.priority_id = tp.id
    LEFT JOIN service_levels sl ON t.service_level_id = sl.id
  `;
  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Calcula os índices corretos para limit e offset
  const limitIndex = currentParamIndex;
  const offsetIndex = currentParamIndex + 1;

  const ticketsQuery = `
  SELECT 
    t.id, 
    t.title, 
    COALESCE(ts.name, 'Sem status') AS status_name, 
    COALESCE(tp.name, 'Sem prioridade') AS priority_name, 
    COALESCE(sl.name, 'Sem nível de serviço') AS service_level_name, 
    t.created_at,
    COALESCE(c.name, 'Sem categoria') AS category_name,
    COALESCE(u_client.name, 'Cliente desconhecido') AS client_name,
    COALESCE(u_agent.name, 'Sem agente') AS agent_name
  ${baseQuery}
  ${whereClause}
  ORDER BY ${orderByField} ${orderByOrder}
  LIMIT $${limitIndex} OFFSET $${offsetIndex}
`;
  const ticketsQueryParams = [...queryParams, parseInt(limit), offset];

  console.log('ticketsQuery:', ticketsQuery);
  console.log('ticketsQueryParams:', ticketsQueryParams);
  const { rows: tickets } = await pool.query(ticketsQuery, ticketsQueryParams);

  const countQuery = `
    SELECT COUNT(*)
    ${baseQuery}
    ${whereClause}
  `;
  console.log('countQuery:', countQuery);
  console.log('queryParams for count:', queryParams);
  const { rows: countResult } = await pool.query(countQuery, queryParams);
  const total = parseInt(countResult[0].count, 10);

  res.status(200).json({ tickets, total });
});


// @desc    Listar os tickets do próprio usuário
// @route   GET /api/tickets/mytickets
// @access  Privado (Cliente)
const getMyTickets = asyncHandler(async (req, res) => {
  const client_id = req.user.id;
  const { page = 1, limit = 10, search = '', sortField = 'created_at', sortOrder = 'desc' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let whereClauses = [`t.client_id = ${1}`];
  const queryParams = [client_id];
  let paramIndex = 2;

  if (search) {
    whereClauses.push(`(t.title ILIKE ${paramIndex} OR t.description ILIKE ${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  const validSortFields = ['id', 'title', 'status_name', 'priority_name', 'service_level_name', 'created_at', 'category_name'];
  const orderByField = validSortFields.includes(sortField) ? sortField : 'created_at';
  const orderByOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const baseQuery = `
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    JOIN ticket_statuses ts ON t.status_id = ts.id
    JOIN ticket_priorities tp ON t.priority_id = tp.id
    JOIN service_levels sl ON t.service_level_id = sl.id
  `;

  const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

  const ticketsQuery = `
    SELECT
      t.id, t.title, ts.name as status_name, tp.name as priority_name, sl.name as service_level_name, t.created_at,
      c.name as category_name
    ${baseQuery}
    ${whereClause}
    ORDER BY ${orderByField} ${orderByOrder}
    LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
  `;
  const { rows: tickets } = await pool.query(ticketsQuery, [...queryParams, parseInt(limit), offset]);

  const countQuery = `
    SELECT COUNT(*)
    ${baseQuery}
    ${whereClause}
  `;
  const { rows: countResult } = await pool.query(countQuery, queryParams);
  const total = parseInt(countResult[0].count, 10);

  res.status(200).json({ tickets, total });
});

// @desc    Obter um ticket por ID com comentários
// @route   GET /api/tickets/:id
// @access  Privado
const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Pega os detalhes do ticket
  const ticketResult = await pool.query(
    `SELECT 
      t.*,
      ts.name as status_name,
      tp.name as priority_name,
      sl.name as service_level_name
    FROM tickets t
    JOIN ticket_statuses ts ON t.status_id = ts.id
    JOIN ticket_priorities tp ON t.priority_id = tp.id
    JOIN service_levels sl ON t.service_level_id = sl.id
    WHERE t.id = $1`,
    [id]
  );

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
  const { status_id, priority_id, service_level_id, agent_id } = req.body;

  console.log('updateTicket: req.body', req.body); // Log do corpo da requisição

  const oldTicketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
  const oldTicket = oldTicketResult.rows[0];

  console.log('updateTicket: oldTicket from DB', oldTicket); // Log do ticket antigo do DB

  if (!oldTicket) {
    res.status(404);
    throw new Error('Ticket não encontrado.');
  }

  // Prepara os valores para a query de atualização, garantindo fallbacks
  const newStatusId = status_id !== undefined ? status_id : oldTicket.status_id;
  const newPriorityId = priority_id !== undefined ? priority_id : oldTicket.priority_id;
  const newServiceLevelId = service_level_id !== undefined ? service_level_id : oldTicket.service_level_id;
  const newAgentId = agent_id !== undefined ? agent_id : oldTicket.agent_id; // Usa old agent_id se não fornecido

  console.log('updateTicket: Values for query:', { newStatusId, newPriorityId, newServiceLevelId, newAgentId }); // Log dos valores antes da query

  const { rows } = await pool.query(
    'UPDATE tickets SET status_id = $1, priority_id = $2, service_level_id = $3, agent_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
    [newStatusId, newPriorityId, newServiceLevelId, newAgentId, id]
  );

  const updatedTicket = rows[0];

  // Buscar nomes para o email
  const statusNameResult = await pool.query('SELECT name FROM ticket_statuses WHERE id = $1', [updatedTicket.status_id]);
  const priorityNameResult = await pool.query('SELECT name FROM ticket_priorities WHERE id = $1', [updatedTicket.priority_id]);

  const updatedStatusName = statusNameResult.rows[0]?.name;
  const updatedPriorityName = priorityNameResult.rows[0]?.name;

  // Enviar email se o status ou prioridade mudou
  if (oldTicket.status_id !== updatedTicket.status_id || oldTicket.priority_id !== updatedTicket.priority_id) {
    const clientUserResult = await pool.query('SELECT email FROM users WHERE id = $1', [updatedTicket.client_id]);
    const clientEmail = clientUserResult.rows[0]?.email;
    if (clientEmail) {
      sendTicketUpdateEmail(
        clientEmail,
        updatedTicket.id,
        updatedTicket.title,
        `O status do seu ticket foi alterado para <strong>${updatedStatusName}</strong> e a prioridade para <strong>${updatedPriorityName}</strong>.`
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

// @desc    Obter lista de status de ticket
// @route   GET /api/tickets/statuses
// @access  Privado
const getTicketStatuses = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, sla_hours FROM ticket_statuses ORDER BY name ASC');
  res.status(200).json(rows);
});

// @desc    Obter lista de prioridades de ticket
// @route   GET /api/tickets/priorities
// @access  Privado
const getTicketPriorities = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, sla_hours FROM ticket_priorities ORDER BY sla_hours ASC');
  res.status(200).json(rows);
});

// @desc    Obter lista de níveis de suporte de ticket
// @route   GET /api/tickets/support-levels
// @access  Privado
const getTicketSupportLevels = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, sla_hours FROM service_levels ORDER BY name ASC');
  res.status(200).json(rows);
});

module.exports = {
  createTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  updateTicket,
  addCommentToTicket,
  getTicketStatuses,
  getTicketPriorities,
  getTicketSupportLevels,
};