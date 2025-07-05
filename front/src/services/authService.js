const API_URL = 'http://localhost:3000/api'; // URL da API do Helpster

const register = async (name, email, password, role) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao registrar');
  }
  return data;
};

const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao fazer login');
  }
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

const getProtectedData = async (token) => {
  const response = await fetch(`${API_URL}/protected`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar dados protegidos');
  }
  return data;
};

const getAdminData = async (token) => {
  const response = await fetch(`${API_URL}/admin`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar dados de admin');
  }
  return data;
};

const getManagerData = async (token) => {
  const response = await fetch(`${API_URL}/manager-area`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar dados de gerente');
  }
  return data;
};

// Mocked user and role management functions
const getUsers = async (token) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao buscar usuários');
  }
  return data;
};

const getAllPermissions = async (token) => {
  const response = await fetch(`${API_URL}/permissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao buscar permissões');
  }
  return data;
};

const getAllRoles = async (token) => {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao buscar perfis');
  }
  return data;
};

const createRole = async (token, roleData) => {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(roleData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao criar perfil');
  }
  return data;
};

const updateRolePermissions = async (token, roleId, permissions) => {
  const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ permissions }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao atualizar permissões do perfil');
  }
  return data;
};

const deleteRole = async (token, roleId) => {
  const response = await fetch(`${API_URL}/roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao deletar perfil');
  }
  return data;
};

export default {
  register,
  login,
  getProtectedData,
  getAdminData,
  getManagerData,
  getUsers,
  getAllPermissions,
  getAllRoles,
  createRole,
  updateRolePermissions,
  deleteRole,
};
