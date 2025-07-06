const asyncHandler = require('express-async-handler');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Listar todos os usuários
// @route   GET /api/users
// @access  Privado (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { rows: users } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.is_active, u.service_level_id, sl.name as service_level_name
     FROM users u
     LEFT JOIN service_levels sl ON u.service_level_id = sl.id
     ORDER BY u.id ASC`
  );

  const usersWithPermissions = await Promise.all(users.map(async user => {
    const permissionsResult = await pool.query(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = $1`,
      [user.role]
    );
    const permissions = permissionsResult.rows.map(row => row.name);
    return { ...user, permissions };
  }));

  res.status(200).json(usersWithPermissions);
});

// @desc    Criar um novo usuário
// @route   POST /api/users
// @access  Privado (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, service_level_id } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Nome, email e senha são obrigatórios.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUserResult = await pool.query(
      'INSERT INTO users (name, email, password, role, service_level_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, is_active, service_level_id',
      [name, email, hashedPassword, role || 'user', service_level_id || null]
    );
    const newUser = newUserResult.rows[0];

    const permissionsResult = await pool.query(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = $1`,
      [newUser.role]
    );
    const permissions = permissionsResult.rows.map(row => row.name);

    res.status(201).json({ ...newUser, permissions });
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
  const { name, email, password, role, is_active, service_level_id } = req.body;

  // Buscar o usuário existente
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (userResult.rows.length === 0) {
    res.status(404);
    throw new Error('Usuário não encontrado.');
  }
  const oldUser = userResult.rows[0];

  let hashedPassword = oldUser.password;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }

  try {
    const updatedUserResult = await pool.query(
      'UPDATE users SET name = $1, email = $2, password = $3, role = $4, is_active = $5, service_level_id = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id, name, email, role, is_active, service_level_id',
      [name || oldUser.name, email || oldUser.email, hashedPassword, role || oldUser.role, is_active !== undefined ? is_active : oldUser.is_active, service_level_id !== undefined ? service_level_id : oldUser.service_level_id, id]
    );
    const updatedUser = updatedUserResult.rows[0];

    const permissionsResult = await pool.query(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = $1`,
      [updatedUser.role]
    );
    const permissions = permissionsResult.rows.map(row => row.name);

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
  const { rows } = await pool.query('SELECT u.id, u.name, u.email, u.service_level_id, sl.name as service_level_name FROM users u LEFT JOIN service_levels sl ON u.service_level_id = sl.id WHERE u.role = $1 AND u.is_active = TRUE ORDER BY u.name ASC', ['agent']);
  res.status(200).json(rows);
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  getAgents,
};
