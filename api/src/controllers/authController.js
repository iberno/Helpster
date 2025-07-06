const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Importa o modelo User
const Role = require('../models/Role'); // Importa o modelo Role
require('dotenv').config();

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role: roleNameFromReq } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    // A role padrão é 'user' se não for fornecida na requisição
    const roleToAssign = roleNameFromReq || 'user';

    const newUser = await User.create(name, email, hashedPassword, roleToAssign, null); // service_level_id é null por padrão no registro

    // Buscar as permissões do novo usuário através do modelo Role
    const permissions = await Role.getPermissionsByRoleName(newUser.role);

    const payload = {
      id: newUser.id,
      role: newUser.role,
      permissions: permissions,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { ...newUser, permissions: permissions } });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409);
      throw new Error('Email já cadastrado.');
    }
    throw error; // Deixa o errorHandler centralizado cuidar
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);

  if (!user) {
    res.status(401);
    throw new Error('Credenciais inválidas.');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Credenciais inválidas.');
  }

  // Buscar as permissões do usuário através do modelo Role
  const permissions = await Role.getPermissionsByRoleName(user.role);

  const payload = {
    id: user.id,
    role: user.role,
    permissions: permissions, // Incluir permissões no payload
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, is_active: user.is_active, permissions: permissions } });
});

module.exports = { register, login };