const { pool } = require('../config/database');

const Role = {
  getAll: async () => {
    const query = `
      SELECT
        r.id,
        r.name,
        r.is_active,
        COALESCE(json_agg(p.name) FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name, r.is_active
      ORDER BY r.name ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  create: async (name) => {
    const { rows } = await pool.query(
      'INSERT INTO roles (name) VALUES ($1) RETURNING id, name, is_active',
      [name]
    );
    return rows[0];
  },

  findById: async (id) => {
    const query = `
      SELECT
        r.id,
        r.name,
        r.is_active,
        COALESCE(json_agg(p.name) FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id, r.name, r.is_active;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  update: async (id, name) => {
    const { rows } = await pool.query(
      'UPDATE roles SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active',
      [name, id]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    return rowCount;
  },

  toggleActiveStatus: async (id, is_active) => {
    const { rows } = await pool.query(
      'UPDATE roles SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active',
      [is_active, id]
    );
    return rows[0];
  },

  getPermissionsByRoleId: async (roleId) => {
    // Primeiro, obtenha o nome da role a partir do ID
    const roleResult = await pool.query('SELECT name FROM roles WHERE id = $1', [roleId]);
    if (roleResult.rows.length === 0) {
      return []; // Role não encontrada
    }
    const roleName = roleResult.rows[0].name;

    const { rows } = await pool.query(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = $1`,
      [roleName]
    );
    return rows.map(row => row.name);
  },

  getPermissionsByRoleName: async (roleName) => {
    const { rows } = await pool.query(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = $1`,
      [roleName]
    );
    return rows.map(row => row.name);
  },

  addPermissionsToRole: async (roleId, permissionIds) => {
    if (!permissionIds || permissionIds.length === 0) return;
    const values = permissionIds.map(permId => `(${roleId}, ${permId})`).join(',');
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`
    );
  },

  removePermissionsFromRole: async (roleId) => {
    await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
  },

  getAllPermissions: async () => {
    const { rows } = await pool.query('SELECT * FROM permissions ORDER BY name ASC');
    return rows;
  },
};

module.exports = Role;
