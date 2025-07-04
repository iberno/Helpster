import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const ManagerPage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || (user?.role !== 'admin' && user?.role !== 'manager')) {
        alert('Acesso negado. Apenas gerentes e administradores podem acessar esta página.');
        navigate('/login');
        return;
      }
      try {
        const data = await authService.getManagerData(token);
        setMessage(data.message);
      } catch (error) {
        alert(error.message);
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, navigate, logout]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Página do Gerente</h2>
        <p className="text-lg text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default ManagerPage;
