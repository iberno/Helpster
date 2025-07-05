import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        console.log("Usuário decodificado:", decodedUser);
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = (onLogoutSuccess) => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (onLogoutSuccess && typeof onLogoutSuccess === 'function') {
      onLogoutSuccess();
    }
  };

  return { token, user, login, logout };
};

export default useAuth;
