import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';

const ManagerPage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    // Se o token existe mas o usuário ainda não foi decodificado, espere.
    if (token && !user) {
      setLoading(true);
      return;
    }

    // Se não há usuário ou a role não é permitida, redirecione.
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      showAlert('Acesso negado. Apenas gerentes e administradores podem acessar esta página.', 'error');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const data = await authService.getManagerData(token);
        setMessage(data.message);
      } catch (error) {
        showAlert(error.message, 'error');
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, navigate, logout, showAlert]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-zinc-900 p-4">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Página do Gerente</h2>
        <p className="text-lg text-gray-700 dark:text-gray-200">{message}</p>
      </div>
    </div>
  );
};

export default ManagerPage;
