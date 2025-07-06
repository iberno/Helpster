const API_URL = 'http://localhost:3000/api'; // URL da API do Helpster

const api = {
  _fetchApi: async (endpoint, method, token = null, body = null, queryParams = null, signal = null) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Não defina Content-Type para FormData, o navegador faz isso automaticamente
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    let url = `${API_URL}${endpoint}`;
    if (queryParams) {
      const processedQueryParams = {};
      for (const key in queryParams) {
        if (Array.isArray(queryParams[key])) {
          processedQueryParams[key] = queryParams[key].join(',');
        } else {
          processedQueryParams[key] = queryParams[key];
        }
      }
      const params = new URLSearchParams(processedQueryParams);
      url = `${url}?${params.toString()}`;
    }

    const options = {
      method,
      headers,
      token,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : null),
      signal, // Adiciona o signal aqui
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro na requisição: ${response.statusText}`);
    }
    return data;
  },

  get: (endpoint, token, queryParams = null, signal = null) => api._fetchApi(endpoint, 'GET', token, null, queryParams, signal),
  post: (endpoint, token, body, signal = null) => api._fetchApi(endpoint, 'POST', token, body, null, signal),
  put: (endpoint, token, body, signal = null) => api._fetchApi(endpoint, 'PUT', token, body, null, signal),
  delete: (endpoint, token, signal = null) => api._fetchApi(endpoint, 'DELETE', token, null, null, signal),
};

export default api;
