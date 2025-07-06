const asyncHandler = require('express-async-handler');
const Category = require('../models/Category'); // Importa o modelo Category

// @desc    Criar uma nova categoria
// @route   POST /api/categories
// @access  Privado (Admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('O nome da categoria é obrigatório.');
  }

  const newCategory = await Category.create(name, description);

  res.status(201).json(newCategory);
});

// @desc    Listar todas as categorias
// @route   GET /api/categories
// @access  Privado (Autenticado)
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll();
  res.status(200).json(categories);
});

// @desc    Obter uma categoria por ID
// @route   GET /api/categories/:id
// @access  Privado (Autenticado)
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error('Categoria não encontrada.');
  }

  res.status(200).json(category);
});

// @desc    Atualizar uma categoria
// @route   PUT /api/categories/:id
// @access  Privado (Admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const updatedCategory = await Category.update(id, name, description);

  if (!updatedCategory) {
    res.status(404);
    throw new Error('Categoria não encontrada.');
  }

  res.status(200).json(updatedCategory);
});

// @desc    Deletar uma categoria
// @route   DELETE /api/categories/:id
// @access  Privado (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rowCount = await Category.delete(id);

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