import api from './api';

const uploadKbImage = async (token, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.post('/kb/upload-image', token, formData);
};

const createArticle = async (token, articleData) => {
  return api.post('/kb/articles', token, articleData);
};

const getAllArticles = async (token) => {
  return api.get('/kb/articles', token);
};

const getArticleById = async (token, id, signal) => {
  return api.get(`/kb/articles/${id}`, token, null, signal);
};

const updateArticle = async (token, id, articleData) => {
  return api.put(`/kb/articles/${id}`, token, articleData);
};

const deleteArticle = async (token, id) => {
  return api.delete(`/kb/articles/${id}`, token);
};

export default {
  uploadKbImage,
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};