const asyncHandler = require('express-async-handler');
const { pool } = require('../config/database');

// @desc    Criar uma nova categoria
// @route   POST /api/categories
// @access  Privado (Admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('O nome da categoria é obrigatório.');
  }

  const { rows } = await pool.query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  );

  res.status(201).json(rows[0]);
});

// @desc    Listar todas as categorias
// @route   GET /api/categories
// @access  Privado (Autenticado)
const getAllCategories = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.status(200).json(rows);
});

// @desc    Obter uma categoria por ID
// @route   GET /api/categories/:id
// @access  Privado (Autenticado)
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

  if (rows.length === 0) {
    res.status(404);
    throw new Error('Categoria não encontrada.');
  }

  res.status(200).json(rows[0]);
});

// @desc    Atualizar uma categoria
// @route   PUT /api/categories/:id
// @access  Privado (Admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const { rows } = await pool.query(
    'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name, description, id]
  );

  if (rows.length === 0) {
    res.status(404);
    throw new Error('Categoria não encontrada.');
  }

  res.status(200).json(rows[0]);
});

// @desc    Deletar uma categoria
// @route   DELETE /api/categories/:id
// @access  Privado (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);

  if (rowCount === 0) {
    res.status(404);
    throw new Error('Categoria não encontrada.');
  }

  res.status(200).json({ message: 'Categoria deletada com sucesso.' });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
