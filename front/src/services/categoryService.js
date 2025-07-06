import api from './api';

const createCategory = async (token, categoryData) => {
  return api.post('/categories', token, categoryData);
};

const getAllCategories = async (token) => {
  return api.get('/categories', token);
};

const getCategoryById = async (token, id) => {
  return api.get(`/categories/${id}`, token);
};

const updateCategory = async (token, id, updateData) => {
  return api.put(`/categories/${id}`, token, updateData);
};

const deleteCategory = async (token, id) => {
  return api.delete(`/categories/${id}`, token);
};

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};