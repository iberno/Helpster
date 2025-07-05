import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import BackButton from '../../components/BackButton';
import { allPermissions as staticAllPermissions } from '../../data/permissions';
import { useAlert } from '../../contexts/AlertContext';

const RoleManagementPage = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editSelectedPermissions, setEditSelectedPermissions] = useState([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [token, showAlert]);

  const fetchRoles = async () => {
    try {
      const rolesData = await authService.getAllRoles(token);
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      showAlert('Falha ao buscar perfis.', 'error');
    }
  };

  const fetchPermissions = async () => {
    try {
      const permissionsData = await authService.getAllPermissions(token);
      setAllPermissions(permissionsData);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      showAlert('Falha ao buscar permissões.', 'error');
    }
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleEditPermissionChange = (permissionId) => {
    setEditSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (roleName.trim() === '') {
      showAlert('O nome do perfil não pode ser vazio.', 'error');
      return;
    }
    try {
      const newRole = await authService.createRole(token, {
        name: roleName,
        permissions: selectedPermissions,
      });
      setRoles([...roles, newRole]);
      setRoleName('');
      setSelectedPermissions([]);
      showAlert('Perfil criado com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to create role:', error);
      showAlert('Falha ao criar perfil.', 'error');
    }
  };

  const handleEditClick = (role) => {
    setEditingRole(role.id);
    setEditRoleName(role.name);
    const currentPermissionIds = role.permissions.map(pName => allPermissions.find(p => p.name === pName)?.id).filter(Boolean);
    setEditSelectedPermissions(currentPermissionIds);
  };

  const handleUpdateRole = async (roleId) => {
    try {
      const permissionsToUpdate = editSelectedPermissions;
      await authService.updateRolePermissions(token, roleId, permissionsToUpdate);
      setEditingRole(null);
      fetchRoles();
      showAlert('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to update role:', error);
      showAlert('Falha ao atualizar perfil.', 'error');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Tem certeza que deseja deletar este perfil? Isso removerá todas as associações de permissão.')) {
      try {
        await authService.deleteRole(token, roleId);
        fetchRoles();
        showAlert('Perfil deletado com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to delete role:', error);
        showAlert('Falha ao deletar perfil.', 'error');
      }
    }
  };

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-zinc-800 dark:text-gray-100 border-0">
        <div className="rounded-t bg-white dark:bg-zinc-700 mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-gray-800 dark:text-gray-100 text-xl font-bold">Gerenciamento de Perfis</h6>
            <BackButton to="/admin" />
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleCreateRole}>
            <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">Criar Novo Perfil</h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Nome do Perfil</label>
                  <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" required />
                </div>
              </div>
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Permissões</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allPermissions.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2">
                        <input type="checkbox" checked={selectedPermissions.includes(permission.id)} onChange={() => handlePermissionChange(permission.id)} className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-gray-700 dark:text-gray-200">{permission.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <button type="submit" className="bg-blue-500 text-white active:bg-blue-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">Criar Perfil</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded dark:bg-zinc-800 dark:text-gray-100">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-gray-50 dark:bg-zinc-700">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100">Perfis Existentes</h3>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Nome</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Permissões</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="dark:bg-zinc-800">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{role.name}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                    <ul className="list-disc list-inside">
                      {role.permissions.map((p) => (
                        <li key={p} className="text-gray-700 dark:text-gray-200">{staticAllPermissions.find(perm => perm.id === p)?.description || p}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                    <button onClick={() => handleEditClick(role)} className="bg-yellow-500 text-white active:bg-yellow-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">Editar</button>
                    <button onClick={() => handleDeleteRole(role.id)} className="bg-red-500 text-white active:bg-red-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;
