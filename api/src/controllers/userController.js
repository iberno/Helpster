const asyncHandler = require('express-async-handler');
const { pool } = require('../config/database');

// @desc    Listar todos os usuários
// @route   GET /api/users
// @access  Privado (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, role FROM users ORDER BY id ASC');
  res.status(200).json(rows);
});

module.exports = {
  getAllUsers,
};
