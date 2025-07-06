const asyncHandler = require('express-async-handler');
const Role = require('../models/Role'); // Importa o modelo Role

// @desc    Listar todas as permissões disponíveis
// @route   GET /api/permissions
// @access  Privado (Admin)
const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Role.getAllPermissions();
  res.status(200).json(permissions);
});

// @desc    Criar um novo perfil (role)
// @route   POST /api/roles
// @access  Privado (Admin)
const createRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('O nome do perfil é obrigatório.');
  }

  const newRole = await Role.create(name);

  if (permissions && permissions.length > 0) {
    await Role.addPermissionsToRole(newRole.id, permissions);
  }

  const roleWithPermissions = await Role.getAll().then(roles => roles.find(r => r.id === newRole.id));
  res.status(201).json({ ...roleWithPermissions, permissions: permissions || [] });
});

// @desc    Listar todos os perfis (roles) com suas permissões
// @route   GET /api/roles
// @access  Privado (Admin)
const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.getAll();
  res.status(200).json(roles);
});

// @desc    Atualizar as permissões de um perfil
// @route   PUT /api/roles/:id/permissions
// @access  Privado (Admin)
const updateRolePermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body; // Array de IDs de permissão

  const roleExists = await Role.findById(id);
  if (!roleExists) {
    res.status(404);
    throw new Error('Perfil não encontrado.');
  }

  await Role.removePermissionsFromRole(id);

  if (permissions && permissions.length > 0) {
    await Role.addPermissionsToRole(id, permissions);
  }

  const updatedRole = await Role.getAll().then(roles => roles.find(r => r.id === id));
  res.status(200).json(updatedRole);
});

// @desc    Deletar um perfil (role)
// @route   DELETE /api/roles/:id
// @access  Privado (Admin)
const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rowCount = await Role.delete(id);

  if (rowCount === 0) {
    res.status(404);
    throw new Error('Perfil não encontrado.');
  }

  res.status(200).json({ message: 'Perfil deletado com sucesso.' });
});

// @desc    Atualizar um perfil (role)
// @route   PUT /api/roles/:id
// @access  Privado (Admin)
const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  const oldRole = await Role.findById(id);
  if (!oldRole) {
    res.status(404);
    throw new Error('Perfil não encontrado.');
  }

  const updatedRole = await Role.update(id, name);

  await Role.removePermissionsFromRole(id);

  if (permissions && permissions.length > 0) {
    await Role.addPermissionsToRole(id, permissions);
  }

  const roleWithPermissions = await Role.findById(id);
  res.status(200).json(roleWithPermissions);
});

// @desc    Alternar o status de ativo/inativo de um perfil (role)
// @route   PUT /api/roles/:id/toggle-active
// @access  Privado (Admin)
const toggleRoleActiveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const roleExists = await Role.findById(id);
  if (!roleExists) {
    res.status(404);
    throw new Error('Perfil não encontrado.');
  }

  const updatedRole = await Role.toggleActiveStatus(id, is_active);
  res.status(200).json(updatedRole);
});

module.exports = {
  getAllPermissions,
  createRole,
  getAllRoles,
  updateRolePermissions,
  deleteRole,
  updateRole,
  toggleRoleActiveStatus,
};