import api from './api';

const register = async (name, email, password, role) => {
  return api.post('/auth/register', null, { name, email, password, role });
};

const login = async (email, password) => {
  const data = await api.post('/auth/login', null, { email, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

const getProtectedData = async (token) => {
  return api.get('/protected', token);
};

const getAdminData = async (token) => {
  return api.get('/admin', token);
};

const getManagerData = async (token) => {
  return api.get('/manager-area', token);
};

const getUsers = async (token) => {
  const response = await api.get('/users', token);
  return response;
};

const getAllPermissions = async (token) => {
  return api.get('/permissions', token);
};

const getAllRoles = async (token) => {
  return api.get('/roles', token);
};

const createRole = async (token, roleData) => {
  return api.post('/roles', token, roleData);
};

const updateRolePermissions = async (token, roleId, permissions) => {
  return api.put(`/roles/${roleId}/permissions`, token, { permissions });
};

const deleteRole = async (token, roleId) => {
  return api.delete(`/roles/${roleId}`, token);
};

const createUser = async (token, userData) => {
  const response = await api.post('/users', token, userData);
  return response;
};

const updateUser = async (token, userId, userData) => {
  const response = await api.put(`/users/${userId}`, token, userData);
  return response;
};

const getAgents = async (token) => {
  return api.get('/users/agents', token);
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
  createUser,
  updateUser,
  getAgents,
};