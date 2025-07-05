import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import BackButton from '../../components/BackButton';
import { useAlert } from '../../contexts/AlertContext';

const UserManagementPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await authService.getUsers(token);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        showAlert('Falha ao buscar usuários.', 'error');
      }
    };
    if (token) {
      fetchUsers();
    }
  }, [token, showAlert]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = await authService.createUser(token, { name, email, password, role });
      setUsers([...users, newUser]);
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      showAlert('Usuário criado com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to create user:', error);
      showAlert('Falha ao criar usuário.', 'error');
    }
  };

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-zinc-800 dark:text-gray-100 border-0">
        <div className="rounded-t bg-white dark:bg-zinc-700 mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-gray-800 dark:text-gray-100 text-xl font-bold">Gerenciamento de Usuários</h6>
            <BackButton to="/admin" />
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleCreateUser}>
            <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">Informações do Usuário</h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2" htmlFor="grid-password">Nome</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" required />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2" htmlFor="grid-password">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" required />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2" htmlFor="grid-password">Senha</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" required />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2" htmlFor="grid-password">Perfil</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <button type="submit" className="bg-blue-500 text-white active:bg-blue-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">Criar Usuário</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded dark:bg-zinc-800 dark:text-gray-100">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-gray-50 dark:bg-zinc-700">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100">Usuários</h3>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Nome</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Email</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Perfil</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="dark:bg-zinc-800">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{user.name}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{user.email}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
