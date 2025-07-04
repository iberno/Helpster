const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
require('dotenv').config();

const asyncHandler = require('express-async-handler');

const register = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

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

  const payload = {
    id: user.id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

module.exports = { register, login };
