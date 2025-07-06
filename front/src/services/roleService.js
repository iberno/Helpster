import api from './api';

const roleService = {
  getAllRoles: async (token) => {
    try {
      const response = await api.get('/roles', token);
      return response;
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      throw error;
    }
  },

  updateRole: async (token, roleId, roleData) => {
    try {
      const response = await api.put(`/roles/${roleId}`, token, roleData);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  toggleRoleActiveStatus: async (token, roleId, is_active) => {
    try {
      const response = await api.put(`/roles/${roleId}/toggle-active`, token, { is_active });
      return response;
    } catch (error) {
      console.error('Erro ao alternar status do perfil:', error);
      throw error;
    }
  },
};

export default roleService;
