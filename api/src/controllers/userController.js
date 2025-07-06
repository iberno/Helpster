const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Importa o modelo User
const Role = require('../models/Role'); // Importa o modelo Role

// @desc    Listar todos os usuários
// @route   GET /api/users
// @access  Privado (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll();

  const usersWithPermissions = await Promise.all(users.map(async user => {
    const permissions = await Role.getPermissionsByRoleName(user.role);
    return { ...user, permissions };
  }));

  res.status(200).json(usersWithPermissions);
});

// @desc    Criar um novo usuário
// @route   POST /api/users
// @access  Privado (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role: roleName, service_level_id } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Nome, email e senha são obrigatórios.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const roles = await Role.getAll();
    const selectedRole = roles.find(r => r.name === (roleName || 'user'));
    if (!selectedRole) {
      res.status(400);
      throw new Error('Role especificada não encontrada.');
    }

    const newUser = await User.create(name, email, hashedPassword, selectedRole.id);

    const permissions = await Role.getPermissionsByRoleId(newUser.role_id);

    res.status(201).json({ ...newUser, role: selectedRole.name, permissions });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409);
      throw new Error('Email já cadastrado.');
    }
    throw error; // Deixa o errorHandler centralizado cuidar
  }
});

// @desc    Atualizar um usuário existente
// @route   PUT /api/users/:id
// @access  Privado (Admin)
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role: roleName, is_active, service_level_id } = req.body;

  // Buscar o usuário existente
  const oldUser = await User.findById(id);
  if (!oldUser) {
    res.status(404);
    throw new Error('Usuário não encontrado.');
  }

  let hashedPassword = oldUser.password;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }

  try {
    const updatedUser = await User.update(id, name || oldUser.name, email || oldUser.email, hashedPassword, roleName || oldUser.role, is_active !== undefined ? is_active : oldUser.is_active, service_level_id !== undefined ? service_level_id : oldUser.service_level_id);

    const permissions = await Role.getPermissionsByRoleName(updatedUser.role);

    res.status(200).json({ ...updatedUser, permissions });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409);
      throw new Error('Email já cadastrado.');
    }
    throw error; // Deixa o errorHandler centralizado cuidar
  }
});

// @desc    Listar todos os agentes (usuários com role 'agent')
// @route   GET /api/users/agents
// @access  Privado (Admin, Manager)
const getAgents = asyncHandler(async (req, res) => {
  const agents = await User.findAgents();
  res.status(200).json(agents);
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  getAgents,
};