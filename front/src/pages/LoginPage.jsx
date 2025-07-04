import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import authService from '../services/authService';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await authService.login(email, password);
      authLogin(response.token);
      navigate('/protected'); // Redireciona para uma página protegida após o login
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm onSubmit={handleLogin} />
    </div>
  );
};

export default LoginPage;
