const API_URL = 'http://localhost:3000/api';

const uploadKbImage = async (token, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_URL}/kb/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao fazer upload da imagem');
  }
  return data;
};

const createArticle = async (token, articleData) => {
  const response = await fetch(`${API_URL}/kb/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(articleData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao criar artigo');
  }
  return data;
};

const getAllArticles = async (token) => {
  const response = await fetch(`${API_URL}/kb/articles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar artigos');
  }
  return data;
};

const getArticleById = async (token, id, signal) => {
  const response = await fetch(`${API_URL}/kb/articles/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    signal, // Pass the signal to the fetch request
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar artigo');
  }
  return data;
};

const updateArticle = async (token, id, articleData) => {
  const response = await fetch(`${API_URL}/kb/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(articleData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao atualizar artigo');
  }
  return data;
};

const deleteArticle = async (token, id) => {
  const response = await fetch(`${API_URL}/kb/articles/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao deletar artigo');
  }
  return data;
};

export default {
  uploadKbImage,
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
