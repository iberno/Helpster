const asyncHandler = require('express-async-handler');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Listar todos os usuários
// @route   GET /api/users
// @access  Privado (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, role FROM users ORDER BY id ASC');
  res.status(200).json(rows);
});

// @desc    Criar um novo usuário
// @route   POST /api/users
// @access  Privado (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Nome, email e senha são obrigatórios.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'user']
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409);
      throw new Error('Email já cadastrado.');
    }
    throw error; // Deixa o errorHandler centralizado cuidar
  }
});

module.exports = {
  getAllUsers,
  createUser,
};
