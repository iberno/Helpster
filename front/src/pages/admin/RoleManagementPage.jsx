import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import { allPermissions } from '../../data/permissions';

const RoleManagementPage = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await authService.getRoles(token);
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        alert('Falha ao buscar perfis.');
      }
    };
    if (token) {
      fetchRoles();
    }
  }, [token]);

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Perfis</h1>

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
            <li key={role.id} className="p-4 border rounded-lg">
              <h3 className="text-xl font-semibold">{role.name}</h3>
              <p className="text-sm text-gray-500">Permissões:</p>
              <ul className="list-disc list-inside mt-2">
                {role.permissions.map((p) => (
                  <li key={p} className="text-gray-600">{allPermissions.find(perm => perm.id === p)?.description || p}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoleManagementPage;
