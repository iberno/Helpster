const API_URL = 'http://localhost:3000/api'; // Altere se sua API estiver em outra porta/URL

const register = async (email, password, role) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, role }),
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
  // Em um app real, isso viria do backend
  return Promise.resolve([
    { id: 1, email: 'admin@example.com', role: 'admin' },
    { id: 2, email: 'manager@example.com', role: 'manager' },
    { id: 3, email: 'user@example.com', role: 'user' },
  ]);
};

const createUser = async (token, userData) => {
  console.log('Creating user:', userData); // Simula a chamada de API
  return Promise.resolve({ id: Date.now(), ...userData });
};

const getRoles = async (token) => {
  return Promise.resolve([
    { id: 1, name: 'Admin', permissions: ['users:create', 'users:read', 'users:update', 'users:delete', 'roles:create', 'roles:read', 'roles:update', 'roles:delete', 'content:manage', 'settings:update'] },
    { id: 2, name: 'Manager', permissions: ['users:read', 'content:manage'] },
    { id: 3, name: 'User', permissions: ['content:read'] },
  ]);
};

const createRole = async (token, roleData) => {
  console.log('Creating role:', roleData);
  return Promise.resolve({ id: Date.now(), ...roleData });
};

export default {
  register,
  login,
  getProtectedData,
  getAdminData,
  getManagerData,
  getUsers,
  createUser,
  getRoles,
  createRole,
};
