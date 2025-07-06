import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // O backend agora retorna o objeto user completo no login/registro
        // Então, o user do token deve ser o objeto user completo, incluindo permissões
        setUser(decodedUser);
        // console.log("Usuário decodificado:", decodedUser);
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData); // Definir o objeto user completo aqui
  };

  const logout = (onLogoutSuccess) => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (onLogoutSuccess && typeof onLogoutSuccess === 'function') {
      onLogoutSuccess();
    }
  };

  const hasPermission = (permissionName) => {
    return user && user.permissions && user.permissions.includes(permissionName);
  };

  return { token, user, login, logout, hasPermission };
};

export default useAuth;
