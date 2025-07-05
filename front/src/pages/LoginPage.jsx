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
      authLogin(response.token);
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      showAlert(error.message, 'error');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900 p-4">
      <div className="relative flex flex-col lg:flex-row w-full max-w-4xl bg-white dark:bg-zinc-800 shadow-lg rounded-lg overflow-hidden">
        {/* Coluna da Esquerda (Formulário de Login) */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Login</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Entre com seu e-mail e senha</p>
          <AuthForm onSubmit={handleLogin} />
        </div>

        {/* Coluna da Direita (Imagem) */}
        <div
          className="hidden lg:block lg:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518621736915-f3b1c87cd1fa?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          }}
        >
          <div className="flex items-center justify-center h-full bg-blue-500 bg-opacity-50 dark:bg-blue-800 dark:bg-opacity-50 p-8">
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