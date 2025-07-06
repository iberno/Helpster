const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
require('dotenv').config();

const asyncHandler = require('express-async-handler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUserResult = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_active',
      [name, email, hashedPassword, role || 'user']
    );
    const newUser = newUserResult.rows[0];

    // Buscar as permissões do novo usuário
    const permissionsResult = await pool.query(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = $1`,
      [newUser.role]
    );
    const permissions = permissionsResult.rows.map(row => row.name);

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

  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (userResult.rows.length === 0) {
    res.status(401);
    throw new Error('Credenciais inválidas.');
  }

  const user = userResult.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Credenciais inválidas.');
  }

  // Buscar as permissões do usuário
  const permissionsResult = await pool.query(
    `SELECT p.name FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     JOIN roles r ON rp.role_id = r.id
     WHERE r.name = $1`,
    [user.role]
  );
  const permissions = permissionsResult.rows.map(row => row.name);

  const payload = {
    id: user.id,
    role: user.role,
    permissions: permissions, // Incluir permissões no payload
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, is_active: user.is_active, permissions: permissions } });
});

module.exports = { register, login };
