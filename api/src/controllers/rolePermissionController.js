const asyncHandler = require('express-async-handler');
const { pool } = require('../config/database');

// @desc    Listar todas as permissões disponíveis
// @route   GET /api/permissions
// @access  Privado (Admin)
const getAllPermissions = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM permissions ORDER BY name ASC');
  res.status(200).json(rows);
});

// @desc    Criar um novo perfil (role)
// @route   POST /api/roles
// @access  Privado (Admin)
const createRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('O nome do perfil é obrigatório.');
  }

  // Inserir o perfil
  const { rows: roleRows } = await pool.query(
    'INSERT INTO roles (name) VALUES ($1) RETURNING id, name',
    [name]
  );
  const newRole = roleRows[0];

  // Associar permissões, se houver
  if (permissions && permissions.length > 0) {
    const values = permissions.map(permId => `(${newRole.id}, ${permId})`).join(',');
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`
    );
  }

  res.status(201).json({ ...newRole, permissions: permissions || [] });
});

// @desc    Listar todos os perfis (roles) com suas permissões
// @route   GET /api/roles
// @access  Privado (Admin)
const getAllRoles = asyncHandler(async (req, res) => {
  const query = `
    SELECT
      r.id,
      r.name,
      COALESCE(json_agg(p.name) FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    GROUP BY r.id, r.name
    ORDER BY r.name ASC;
  `;
  const { rows } = await pool.query(query);
  res.status(200).json(rows);
});

// @desc    Atualizar as permissões de um perfil
// @route   PUT /api/roles/:id/permissions
// @access  Privado (Admin)
const updateRolePermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body; // Array de IDs de permissão

  // Verificar se o perfil existe
  const roleExists = await pool.query('SELECT id FROM roles WHERE id = $1', [id]);
  if (roleExists.rows.length === 0) {
    res.status(404);
    throw new Error('Perfil não encontrado.');
  }

  // Remover permissões antigas
  await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

  // Adicionar novas permissões, se houver
  if (permissions && permissions.length > 0) {
    const values = permissions.map(permId => `(${id}, ${permId})`).join(',');
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`
    );
  }

  const updatedRole = await pool.query(
    `SELECT
      r.id,
      r.name,
      COALESCE(json_agg(p.name) FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE r.id = $1
    GROUP BY r.id, r.name;`,
    [id]
  );

  res.status(200).json(updatedRole.rows[0]);
});

// @desc    Deletar um perfil (role)
// @route   DELETE /api/roles/:id
// @access  Privado (Admin)
const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { rowCount } = await pool.query('DELETE FROM roles WHERE id = $1', [id]);

  if (rowCount === 0) {
    res.status(404);
    throw new Error('Perfil não encontrado.');
  }

  res.status(200).json({ message: 'Perfil deletado com sucesso.' });
});

// @desc    Atualizar um perfil (role)
// @route   PUT /api/roles/:id
// @access  Privado (Admin)
const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  // Verificar se o perfil existe
  const roleExists = await pool.query('SELECT id FROM roles WHERE id = $1', [id]);
  if (roleExists.rows.length === 0) {
    res.status(404);
    throw new Error('Perfil não encontrado.');
  }

  // Atualizar o nome do perfil
  await pool.query('UPDATE roles SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [name, id]);

  // Remover permissões antigas
  await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

  // Adicionar novas permissões, se houver
  if (permissions && permissions.length > 0) {
    const values = permissions.map(permId => `(${id}, ${permId})`).join(',');
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`
    );
  }

  const updatedRole = await pool.query(
    `SELECT
      r.id,
      r.name,
      r.is_active,
      COALESCE(json_agg(p.name) FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE r.id = $1
    GROUP BY r.id, r.name, r.is_active;`,
    [id]
  );

  res.status(200).json(updatedRole.rows[0]);
});

// @desc    Alternar o status de ativo/inativo de um perfil (role)
// @route   PUT /api/roles/:id/toggle-active
// @access  Privado (Admin)
const toggleRoleActiveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  // Verificar se o perfil existe
  const roleExists = await pool.query('SELECT id FROM roles WHERE id = $1', [id]);
  if (roleExists.rows.length === 0) {
    res.status(404);
    throw new Error('Perfil não encontrado.');
  }

  // Atualizar o status is_active
  const updatedRole = await pool.query(
    'UPDATE roles SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active',
    [is_active, id]
  );

  res.status(200).json(updatedRole.rows[0]);
});

module.exports = {
  getAllPermissions,
  createRole,
  getAllRoles,
  updateRolePermissions,
  deleteRole,
  updateRole,
  toggleRoleActiveStatus,
};
