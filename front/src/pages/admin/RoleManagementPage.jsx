import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import BackButton from '../../components/BackButton';
import { allPermissions as staticAllPermissions } from '../../data/permissions';

const RoleManagementPage = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editSelectedPermissions, setEditSelectedPermissions] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [token]);

  const fetchRoles = async () => {
    try {
      const rolesData = await authService.getAllRoles(token);
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      alert('Falha ao buscar perfis.');
    }
  };

  const fetchPermissions = async () => {
    try {
      const permissionsData = await authService.getAllPermissions(token);
      setAllPermissions(permissionsData);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      alert('Falha ao buscar permissões.');
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
      alert('O nome do perfil não pode ser vazio.');
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
      alert('Perfil criado com sucesso!');
    } catch (error) {
      console.error('Failed to create role:', error);
      alert('Falha ao criar perfil.');
    }
  };

  const handleEditClick = (role) => {
    setEditingRole(role.id);
    setEditRoleName(role.name);
    // Mapeia os nomes das permissões para os IDs correspondentes
    const currentPermissionIds = role.permissions.map(pName => allPermissions.find(p => p.name === pName)?.id).filter(Boolean);
    setEditSelectedPermissions(currentPermissionIds);
  };

  const handleUpdateRole = async (roleId) => {
    try {
      // Mapeia os IDs de permissão de volta para os nomes para enviar ao backend
      const permissionsToUpdate = editSelectedPermissions;
      await authService.updateRolePermissions(token, roleId, permissionsToUpdate);
      setEditingRole(null);
      fetchRoles(); // Recarrega a lista de perfis
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Falha ao atualizar perfil.');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Tem certeza que deseja deletar este perfil? Isso removerá todas as associações de permissão.')) {
      try {
        await authService.deleteRole(token, roleId);
        fetchRoles(); // Recarrega a lista de perfis
        alert('Perfil deletado com sucesso!');
      } catch (error) {
        console.error('Failed to delete role:', error);
        alert('Falha ao deletar perfil.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton to="/admin" />
        <h1 className="text-3xl font-bold text-center flex-grow">Gerenciamento de Perfis</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Criar Novo Perfil</h2>
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nome do Perfil:</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Permissões:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allPermissions.map((permission) => (
                <label key={permission.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-700">{permission.description}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Criar Perfil
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Lista de Perfis</h2>
        <ul className="space-y-4">
          {roles.map((role) => (
            <li key={role.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
              {editingRole === role.id ? (
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Nome:</label>
                    <input
                      type="text"
                      value={editRoleName}
                      onChange={(e) => setEditRoleName(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Permissões:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {allPermissions.map((permission) => (
                        <label key={permission.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editSelectedPermissions.includes(permission.id)}
                            onChange={() => handleEditPermissionChange(permission.id)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                          <span className="text-gray-700 text-sm">{permission.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => handleUpdateRole(role.id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingRole(null)}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold">{role.name}</h3>
                  <p className="text-sm text-gray-500">Permissões:</p>
                  <ul className="list-disc list-inside mt-2">
                    {role.permissions.map((p) => (
                      <li key={p} className="text-gray-600">{staticAllPermissions.find(perm => perm.id === p)?.description || p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {editingRole !== role.id && (
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <button
                    onClick={() => handleEditClick(role)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Deletar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoleManagementPage;
