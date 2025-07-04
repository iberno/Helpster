import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AdminPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o token existe mas o usuário ainda não foi decodificado, espere.
    if (token && !user) {
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate, token]);

  // Adicione um estado de carregamento ou verificação para user
  if (!user || user.role !== 'admin') {
    return <div className="text-center mt-8">Carregando permissões...</div>; // Ou um spinner de carregamento
  }

  return (
    <div className="container mx-auto p-4 dark:text-gray-100">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Painel de Administração</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Gerenciamento de Usuários</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Crie, edite e visualize os usuários do sistema.</p>
          <Link to="/admin/users" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
            Gerenciar Usuários
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Gerenciamento de Perfis</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Crie e defina as permissões para os perfis de acesso.</p>
          <Link to="/admin/roles" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">
            Gerenciar Perfis
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Gerenciamento de Categorias</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Crie, edite e delete categorias de tickets.</p>
          <Link to="/admin/categories" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-200">
            Gerenciar Categorias
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Base de Conhecimento</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Gerencie artigos e documentação para a Base de Conhecimento.</p>
          <Link to="/knowledge-base" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition duration-200">
            Gerenciar Artigos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
