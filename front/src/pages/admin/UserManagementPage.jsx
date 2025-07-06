import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import roleService from '../../services/roleService'; // Importar roleService
import BackButton from '../../components/BackButton';
import { useAlert } from '../../contexts/AlertContext';

const UserManagementPage = () => {
  const { token, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // Novo estado para o usuário em edição
  const [isEditing, setIsEditing] = useState(false); // Novo estado para controlar o modo de edição
  const [is_active, setIsActive] = useState(true); // Novo estado para o status de ativo/inativo
  const [serviceLevelId, setServiceLevelId] = useState(''); // Novo estado para service_level_id
  const [serviceLevels, setServiceLevels] = useState([]); // Novo estado para armazenar níveis de serviço
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const usersData = await authService.getUsers(token);
        setUsers(usersData);

        const rolesData = await roleService.getAllRoles(token);
        console.log('Dados de perfis recebidos:', rolesData);
        setRoles(Array.isArray(rolesData) ? rolesData : []);
        console.log('Estado de perfis atualizado para:', roles);

        const serviceLevelsData = await ticketService.getTicketSupportLevels(token);
        setServiceLevels(serviceLevelsData);
      } catch (error) {
        console.error('Falha ao buscar dados:', error);
        showAlert('Falha ao buscar dados.', 'error');
        setRoles([]); // Garante que roles seja um array vazio em caso de erro
      }
    };
    if (token) {
      fetchUsersAndRoles();
    }
  }, [token, showAlert]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setIsActive(true);
    setServiceLevelId(''); // Resetar service_level_id
    setEditingUser(null);
    setIsEditing(false);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Lógica de edição
        const updatedUser = await authService.updateUser(token, editingUser.id, { name, email, password: password || undefined, role, is_active, service_level_id: serviceLevelId || null });
        setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
        showAlert('Usuário atualizado com sucesso!', 'success');
      } else {
        // Lógica de criação
        const newUser = await authService.createUser(token, { name, email, password, role, service_level_id: serviceLevelId || null });
        setUsers([...users, newUser]);
        showAlert('Usuário criado com sucesso!', 'success');
      }
      resetForm();
    } catch (error) {
      console.error(isEditing ? 'Failed to update user:' : 'Failed to create user:', error);
      showAlert(error.message || (isEditing ? 'Falha ao atualizar usuário.' : 'Falha ao criar usuário.'), 'error');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditing(true);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // Senha não é preenchida para edição
    setRole(user.role);
    setIsActive(user.is_active);
    setServiceLevelId(user.service_level_id || ''); // Preencher service_level_id
  };

  const handleToggleActiveStatus = async (userToToggle) => {
    try {
      const updatedUser = await authService.updateUser(token, userToToggle.id, { is_active: !userToToggle.is_active });
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      showAlert(`Usuário ${updatedUser.is_active ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      showAlert('Falha ao alterar status do usuário.', 'error');
    }
  };

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-zinc-800 dark:text-gray-100 border-0">
        <div className="rounded-t bg-white dark:bg-zinc-800 mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-gray-800 dark:text-gray-100 text-xl font-bold">Gerenciamento de Usuários</h6>
            <BackButton />
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          {hasPermission('users:manage') && (
            <form onSubmit={handleSubmitUser}>
              <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">
                {isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </h6>
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
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" { ...(!isEditing && { required: true }) } />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2" htmlFor="grid-password">Perfil</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                      {roles && roles.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2" htmlFor="service-level">Nível de Serviço</label>
                    <select value={serviceLevelId} onChange={(e) => setServiceLevelId(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                      <option value="">Nenhum</option>
                      {serviceLevels && serviceLevels.map((sl) => (
                        <option key={sl.id} value={sl.id}>{sl.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {isEditing && (
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2" htmlFor="is-active">Ativo</label>
                      <input type="checkbox" id="is-active" checked={is_active} onChange={(e) => setIsActive(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-12/12 px-4">
                  <button type="submit" className="bg-blue-500 text-white active:bg-blue-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">
                    {isEditing ? 'Atualizar Usuário' : 'Criar Usuário'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForm} className="ml-4 bg-gray-500 text-white active:bg-gray-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">
                      Cancelar Edição
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded dark:bg-zinc-800 dark:text-gray-100">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-gray-50 dark:bg-zinc-800">
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
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600">Nome</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600">Email</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600">Perfil</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600">Nível de Serviço</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600">Status</th>
                {hasPermission('users:manage') && (
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users && users.map((user) => (
                <tr key={user.id} className="dark:bg-zinc-800">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-800">{user.name}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-800">{user.email}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-800">{user.role}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-800">{user.service_level_name || 'N/A'}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-800">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {hasPermission('users:manage') && (
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-800">
                      <button onClick={() => handleEditUser(user)} className="bg-blue-500 text-white active:bg-blue-600 font-bold py-1 px-3 rounded-lg text-xs transition duration-200 mr-2">Editar</button>
                      <button onClick={() => handleToggleActiveStatus(user)} className={`font-bold py-1 px-3 rounded-lg text-xs transition duration-200 ${user.is_active ? 'bg-red-500 text-white active:bg-red-600' : 'bg-green-500 text-white active:bg-green-600'}`}>
                        {user.is_active ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  )}
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
