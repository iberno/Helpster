import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import authService from '../services/authService';
import useAuth from '../hooks/useAuth';
import { useAlert } from '../contexts/AlertContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { showAlert } = useAlert();

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await authService.login(email, password);
      authLogin(response.token, response.user);
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      showAlert(error.message, 'error');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-l from-indigo-500 to-green-500 flex items-center justify-center bg-gray-100 dark:bg-zinc-900 p-4">
      <div className="relative flex flex-col lg:flex-row w-full max-w-4xl bg-white dark:bg-zinc-800 shadow-lg rounded-lg overflow-hidden">
        {/* Coluna da Esquerda (Formulário de Login) */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Login</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Entre com seu e-mail e senha</p>
          <AuthForm onSubmit={handleLogin} />
        </div>

        {/* Coluna da Direita (Imagem) */}
        <div className="hidden lg:block lg:w-1/2 bg-cover bg-center bg-[url('https://unsplash.com/pt-br/fotografias/montanhas-nevadas-sob-um-ceu-noturno-estrelado-X-7-aE8DeKA')]">
          <div className="flex items-center justify-center h-full bg-gradient-to-r from-indigo-500 to-green-500 bg-opacity-50 dark:bg-green-800 dark:bg-opacity-50 p-8">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Bem-vindo de volta!</h3>
              <p className="text-lg">Acesse sua conta para continuar.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;