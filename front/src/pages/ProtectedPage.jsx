import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const ProtectedPage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const data = await authService.getProtectedData(token);
        setMessage(data.message);
      } catch (error) {
        alert(error.message);
        logout(); // Token inválido ou expirado, faz logout
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, logout]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Página Protegida</h2>
        <p className="text-lg text-gray-700 mb-2">{message}</p>
        {user && (
          <p className="text-md text-gray-600">Você está logado como: <span className="font-semibold">{user.email}</span> com a role: <span className="font-semibold">{user.role}</span></p>
        )}
      </div>
    </div>
  );
};

export default ProtectedPage;
