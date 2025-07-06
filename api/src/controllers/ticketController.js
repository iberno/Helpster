const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket'); // Importa o modelo Ticket
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

  // Obter IDs padrão para status, prioridade e nível de suporte usando o modelo
  const defaultStatus = await Ticket.getStatuses().then(statuses => statuses.find(s => s.name === 'Aberto'));
  const defaultPriority = await Ticket.getPriorities().then(priorities => priorities.find(p => p.name === (priority_name || 'Média')));
  const defaultServiceLevel = await Ticket.getSupportLevels().then(levels => levels.find(sl => sl.name === (support_level_name || 'N1')));

  const status_id = defaultStatus.id;
  const priority_id = defaultPriority.id;
  const service_level_id = defaultServiceLevel.id;

  const newTicket = await Ticket.create(title, description, client_id, category_id, status_id, priority_id, service_level_id);

  res.status(201).json(newTicket);
});

// @desc    Listar todos os tickets (para Admins e Agentes)
// @route   GET /api/tickets
// @access  Privado (Admin, Agente)
const getAllTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, ...rest } = req.query;
  const { tickets, total } = await Ticket.findAll({ ...rest, page, limit });

  res.status(200).json({ tickets, total });
});

// @desc    Listar os tickets do próprio usuário
// @route   GET /api/tickets/mytickets
// @access  Privado (Cliente)
const getMyTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, ...rest } = req.query;
  const clientId = req.user.id;

  const { tickets, total } = await Ticket.findAll({ ...rest, clientId, page, limit });

  res.status(200).json({ tickets, total });
});

// @desc    Obter um ticket por ID com comentários
// @route   GET /api/tickets/:id
// @access  Privado
const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Pega os detalhes do ticket
  const ticket = await Ticket.findById(id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket não encontrado.');
  }

  // Verifica a permissão: Admin/Agente pode ver qualquer ticket, cliente só pode ver o seu.
  if (user.role === 'user' && ticket.client_id !== user.id) {
    res.status(403);
    throw new Error('Acesso negado. Você não tem permissão para ver este ticket.');
  }

  // Se o usuário não for um cliente ou for o cliente do ticket, permite o acesso.
  // Administradores, gerentes e agentes têm acesso total.
  if (!['admin', 'manager', 'agent'].includes(user.role) && user.id !== ticket.client_id) {
    res.status(403);
    throw new Error('Acesso negado. Você não tem permissão para ver este ticket.');
  }

  // Pega os comentários associados
  const comments = await Ticket.getCommentsByTicketId(id);

  res.status(200).json({ ...ticket, comments });
});

// @desc    Atualizar um ticket (status, prioridade, agente, etc.)
// @route   PUT /api/tickets/:id
// @access  Privado (Admin, Agente)
const updateTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status_id, priority_id, service_level_id, agent_id } = req.body;

  const oldTicket = await Ticket.findById(id);

  if (!oldTicket) {
    res.status(404);
    throw new Error('Ticket não encontrado.');
  }

  // Prepara os valores para a query de atualização, garantindo fallbacks
  const newStatusId = status_id !== undefined ? status_id : oldTicket.status_id;
  const newPriorityId = priority_id !== undefined ? priority_id : oldTicket.priority_id;
  const newServiceLevelId = service_level_id !== undefined ? service_level_id : oldTicket.service_level_id;
  const newAgentId = agent_id !== undefined ? agent_id : oldTicket.agent_id; // Usa old agent_id se não fornecido

  const updatedTicket = await Ticket.update(id, newStatusId, newPriorityId, newServiceLevelId, newAgentId);

  // Buscar nomes para o email
  const statusNameResult = await Ticket.getStatuses().then(statuses => statuses.find(s => s.id === updatedTicket.status_id));
  const priorityNameResult = await Ticket.getPriorities().then(priorities => priorities.find(p => p.id === updatedTicket.priority_id));

  const updatedStatusName = statusNameResult?.name;
  const updatedPriorityName = priorityNameResult?.name;

  // Enviar email se o status ou prioridade mudou
  if (oldTicket.status_id !== updatedTicket.status_id || oldTicket.priority_id !== updatedTicket.priority_id) {
    const clientUserResult = await Ticket.findUserById(updatedTicket.client_id);
    const clientEmail = clientUserResult?.email;
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
    const agentUserResult = await Ticket.findUserById(agent_id);
    const agentEmail = agentUserResult?.email;
    const agentName = agentUserResult?.name;
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

  const newComment = await Ticket.addComment(content, visibility, id, author_id);

  // Se o comentário for público, notificar o cliente do ticket
  if (newComment.visibility === 'Público') {
    const ticket = await Ticket.findById(id);
    if (ticket) {
      const clientUserResult = await Ticket.findUserById(ticket.client_id);
      const clientEmail = clientUserResult?.email;
      if (clientEmail) {
        sendTicketUpdateEmail(
          clientEmail,
          ticket.id,
          ticket.title,
          `Um novo comentário público foi adicionado ao seu ticket: <br/><br/><em>"${newComment.content}"</em>`
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
  const statuses = await Ticket.getStatuses();
  res.status(200).json(statuses);
});

// @desc    Obter lista de prioridades de ticket
// @route   GET /api/tickets/priorities
// @access  Privado
const getTicketPriorities = asyncHandler(async (req, res) => {
  const priorities = await Ticket.getPriorities();
  res.status(200).json(priorities);
});

// @desc    Obter lista de níveis de suporte de ticket
// @route   GET /api/tickets/support-levels
// @access  Privado
const getTicketSupportLevels = asyncHandler(async (req, res) => {
  const supportLevels = await Ticket.getSupportLevels();
  res.status(200).json(supportLevels);
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