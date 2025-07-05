const API_URL = 'http://localhost:3000/api';

const createTicket = async (token, ticketData) => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(ticketData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao criar ticket');
  }
  return data;
};

const getAllTickets = async (token) => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar todos os tickets');
  }
  return data;
};

const getMyTickets = async (token) => {
  const response = await fetch(`${API_URL}/tickets/mytickets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar meus tickets');
  }
  return data;
};

const getTicketById = async (token, id) => {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar ticket por ID');
  }
  return data;
};

const updateTicket = async (token, id, updateData) => {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao atualizar ticket');
  }
  return data;
};

const addCommentToTicket = async (token, ticketId, commentData) => {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(commentData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao adicionar comentário');
  }
  return data;
};

const getCategories = async (token) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar categorias');
  }
  return data;
};

export default {
  createTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  updateTicket,
  addCommentToTicket,
  getCategories,
};