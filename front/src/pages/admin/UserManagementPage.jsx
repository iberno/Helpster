import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';

const UserManagementPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await authService.getUsers(token);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        alert('Falha ao buscar usuários.');
      }
    };
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = await authService.createUser(token, { email, password, role });
      setUsers([...users, newUser]);
      setEmail('');
      setPassword('');
      setRole('user');
      alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Falha ao criar usuário.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Usuários</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Criar Novo Usuário</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Perfil:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Criar Usuário
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Lista de Usuários</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="flex justify-between items-center p-2 border-b">
              <span>{user.email}</span>
              <span className="px-2 py-1 text-sm font-semibold bg-gray-200 text-gray-700 rounded-full">{user.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserManagementPage;
