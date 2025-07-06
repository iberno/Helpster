import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import BackButton from '../../components/BackButton';
import { useAlert } from '../../contexts/AlertContext';
import roleService from '../../services/roleService';

const RoleManagementPage = () => {
  const { token, hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Novo estado para controlar o modo de edição
  const [editingRole, setEditingRole] = useState(null); // Novo estado para o perfil em edição
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [token, showAlert]);

  const fetchRoles = async () => {
    try {
      const rolesData = await roleService.getAllRoles(token);
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

  const resetForm = () => {
    setRoleName('');
    setSelectedPermissions([]);
    setIsEditing(false);
    setEditingRole(null);
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (roleName.trim() === '') {
      showAlert('O nome do perfil não pode ser vazio.', 'error');
      return;
    }
    try {
      if (isEditing) {
        // Lógica de edição
        const updatedRole = await roleService.updateRole(token, editingRole.id, { name: roleName, permissions: selectedPermissions });
        setRoles(roles.map(role => role.id === updatedRole.id ? updatedRole : role));
        showAlert('Perfil atualizado com sucesso!', 'success');
      } else {
        // Lógica de criação
        const newRole = await authService.createRole(token, {
          name: roleName,
          permissions: selectedPermissions,
        });
        setRoles([...roles, newRole]);
        showAlert('Perfil criado com sucesso!', 'success');
      }
      resetForm();
    } catch (error) {
      console.error(isEditing ? 'Failed to update role:' : 'Failed to create role:', error);
      showAlert(error.message || (isEditing ? 'Falha ao atualizar perfil.' : 'Falha ao criar perfil.'), 'error');
    }
  };

  const handleEditClick = (role) => {
    setIsEditing(true);
    setEditingRole(role);
    setRoleName(role.name);
    const currentPermissionIds = role.permissions.map(pName => allPermissions.find(p => p.name === pName)?.id).filter(Boolean);
    setSelectedPermissions(currentPermissionIds);
  };

  const handleToggleActiveStatus = async (roleToToggle) => {
    try {
      const updatedRole = await roleService.toggleRoleActiveStatus(token, roleToToggle.id, !roleToToggle.is_active);
      setRoles(roles.map(role => role.id === updatedRole.id ? { ...role, ...updatedRole } : role));
      showAlert(`Perfil ${updatedRole.is_active ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    } catch (error) {
      console.error('Failed to toggle role status:', error);
      showAlert('Falha ao alterar status do perfil.', 'error');
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

  const groupPermissions = (permissions) => {
    const grouped = {};
    permissions.forEach(perm => {
      const [groupName] = perm.name.split(':');
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(perm);
    });
    return grouped;
  };

  const groupedAllPermissions = groupPermissions(allPermissions);

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-zinc-800 dark:text-gray-100 border-0">
        <div className="rounded-t bg-white dark:bg-zinc-700 mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-gray-800 dark:text-gray-100 text-xl font-bold">Gerenciamento de Perfis</h6>
            <BackButton />
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          {hasPermission('roles:manage') && (
            <form onSubmit={handleSubmitRole}>
              <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">
                {isEditing ? 'Editar Perfil' : 'Criar Novo Perfil'}
              </h6>
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
                    {Object.entries(groupedAllPermissions).map(([group, perms]) => (
                      <div key={group} className="mb-4">
                        <h5 className="text-gray-600 dark:text-gray-300 text-sm font-bold mb-2 capitalize">{group}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {perms.map((permission) => (
                            <label key={permission.id} className="flex items-center space-x-2">
                              <input type="checkbox" checked={selectedPermissions.includes(permission.id)} onChange={() => handlePermissionChange(permission.id)} className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <span className="text-gray-700 dark:text-gray-200">{permission.description}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-12/12 px-4">
                  <button type="submit" className="bg-blue-500 text-white active:bg-blue-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">
                    {isEditing ? 'Atualizar Perfil' : 'Criar Perfil'}
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
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Status</th>
                {hasPermission('roles:manage') && (
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="dark:bg-zinc-800">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{role.name}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                    <ul className="list-disc list-inside">
                      {(role.permissions || []).map((p) => (
                        <li key={p} className="text-gray-700 dark:text-gray-200">{allPermissions.find(perm => perm.name === p)?.description || p}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${role.is_active ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                      {role.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {hasPermission('roles:manage') && (
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                      <button onClick={() => handleEditClick(role)} className="bg-blue-500 text-white active:bg-blue-600 font-bold py-1 px-3 rounded-lg text-xs transition duration-200 mr-2">Editar</button>
                      <button onClick={() => handleToggleActiveStatus(role)} className={`font-bold py-1 px-3 rounded-lg text-xs transition duration-200 ${role.is_active ? 'bg-red-500 text-white active:bg-red-600' : 'bg-green-500 text-white active:bg-green-600'}`}>
                        {role.is_active ? 'Desativar' : 'Ativar'}
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

export default RoleManagementPage;
