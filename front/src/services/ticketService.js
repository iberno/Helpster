import api from './api';

const createTicket = async (token, ticketData) => {
  return api.post('/tickets', token, ticketData);
};

const getAllTickets = async (token, params) => {
  return api.get('/tickets', token, params);
};

const getMyTickets = async (token, params) => {
  return api.get('/tickets/mytickets', token, params);
};

const getTicketById = async (token, id) => {
  return api.get(`/tickets/${id}`, token);
};

const updateTicket = async (token, id, updateData) => {
  return api.put(`/tickets/${id}`, token, updateData);
};

const addCommentToTicket = async (token, ticketId, commentData) => {
  return api.post(`/tickets/${ticketId}/comments`, token, commentData);
};

const getCategories = async (token) => {
  return api.get('/categories', token);
};

const getTicketStatuses = async (token) => {
  return api.get('/tickets/statuses', token);
};

const getTicketPriorities = async (token) => {
  return api.get('/tickets/priorities', token);
};

const getTicketSupportLevels = async (token) => {
  return api.get('/tickets/support-levels', token);
};

export default {
  createTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  updateTicket,
  addCommentToTicket,
  getCategories,
  getTicketStatuses,
  getTicketPriorities,
  getTicketSupportLevels,
};