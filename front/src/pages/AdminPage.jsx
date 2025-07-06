import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AdminCard from '../components/AdminCard';

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
        <AdminCard
          title="Gerenciamento de Usuários"
          description="Crie, edite e visualize os usuários do sistema."
          linkTo="/admin/users"
          linkText="Gerenciar Usuários"
          bgColorClass="bg-blue-500 hover:bg-blue-600"
        />
        <AdminCard
          title="Gerenciamento de Perfis"
          description="Crie e defina as permissões para os perfis de acesso."
          linkTo="/admin/roles"
          linkText="Gerenciar Perfis"
          bgColorClass="bg-green-500 hover:bg-green-600"
        />
        <AdminCard
          title="Gerenciamento de Categorias"
          description="Crie, edite e delete categorias de tickets."
          linkTo="/admin/categories"
          linkText="Gerenciar Categorias"
          bgColorClass="bg-purple-500 hover:bg-purple-600"
        />
        <AdminCard
          title="Base de Conhecimento"
          description="Gerencie artigos e documentação para a Base de Conhecimento."
          linkTo="/knowledge-base"
          linkText="Gerenciar Artigos"
          bgColorClass="bg-indigo-500 hover:bg-indigo-600"
        />
      </div>
    </div>
  );
};

export default AdminPage;
