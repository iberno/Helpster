const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const { register, login } = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../validators/authValidator');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { createTicket, getAllTickets, getMyTickets, getTicketById, updateTicket, addCommentToTicket } = require('../controllers/ticketController');
const { getAllUsers, createUser } = require('../controllers/userController');
const { uploadKbImage, upload } = require('../controllers/uploadController');
const { createArticle, getAllArticles, getArticleById, updateArticle, deleteArticle } = require('../controllers/knowledgeBaseController');
const {
  getAllPermissions,
  createRole,
  getAllRoles,
  updateRolePermissions,
  deleteRole,
} = require('../controllers/rolePermissionController');

// Rotas de Autenticação
router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login', validate(loginSchema), login);


// Rota pública - qualquer um pode acessar
router.get('/public', (req, res) => {
  res.json({ message: 'Esta é uma rota pública.' });
});

// Rota protegida - apenas usuários autenticados (qualquer role)
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Olá, usuário ${req.user.id}! Esta é uma rota protegida.`, user: req.user });
});

// Rota de admin - apenas usuários autenticados com a role 'admin'
router.get('/admin', authenticateToken, authorizeRole(['admin']), (req, res) => {
  res.json({ message: 'Bem-vindo, administrador! Acesso total concedido.' });
});

// Rota de manager - usuários com role 'admin' OU 'manager'
router.get('/manager-area', authenticateToken, authorizeRole(['admin', 'manager']), (req, res) => {
    res.json({ message: 'Área restrita para gerentes e administradores.' });
});

// Rotas de Categorias
router.route('/categories')
  .post(authenticateToken, authorizeRole(['admin']), createCategory)
  .get(authenticateToken, getAllCategories);

router.route('/categories/:id')
  .get(authenticateToken, getCategoryById)
  .put(authenticateToken, authorizeRole(['admin']), updateCategory)
  .delete(authenticateToken, authorizeRole(['admin']), deleteCategory);

// Rotas de Tickets
router.route('/tickets')
  .post(authenticateToken, createTicket)
  .get(authenticateToken, authorizeRole(['admin', 'manager']), getAllTickets);

router.route('/tickets/mytickets')
  .get(authenticateToken, getMyTickets);

router.route('/tickets/mytickets')
  .get(authenticateToken, getMyTickets);



router.route('/tickets/:id')
  .get(authenticateToken, getTicketById)
  .put(authenticateToken, authorizeRole(['admin', 'manager']), updateTicket);

router.route('/tickets/:id/comments')
  .post(authenticateToken, addCommentToTicket);

// Rotas de Usuários
router.route('/users')
  .post(authenticateToken, authorizeRole(['admin']), createUser)
  .get(authenticateToken, authorizeRole(['admin']), getAllUsers);

// Rotas de Upload de Imagens para KB
router.post('/kb/upload-image', authenticateToken, authorizeRole(['admin', 'manager']), upload.single('image'), uploadKbImage);

// Rotas de Permissões
router.route('/permissions')
  .get(authenticateToken, authorizeRole(['admin']), getAllPermissions);

// Rotas de Perfis (Roles)
router.route('/roles')
  .post(authenticateToken, authorizeRole(['admin']), createRole)
  .get(authenticateToken, authorizeRole(['admin']), getAllRoles);

router.route('/roles/:id')
  .delete(authenticateToken, authorizeRole(['admin']), deleteRole);

router.route('/roles/:id/permissions')
  .put(authenticateToken, authorizeRole(['admin']), updateRolePermissions);

// Rotas da Base de Conhecimento
router.route('/kb/articles')
  .post(authenticateToken, authorizeRole(['admin', 'manager']), createArticle)
  .get(authenticateToken, getAllArticles); // Todos autenticados podem ler

router.route('/kb/articles/:id')
  .get(authenticateToken, getArticleById) // Todos autenticados podem ler
  .put(authenticateToken, authorizeRole(['admin', 'manager']), updateArticle)
  .delete(authenticateToken, authorizeRole(['admin', 'manager']), deleteArticle);




module.exports = router;