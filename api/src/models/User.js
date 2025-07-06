const { pool } = require('../config/database');

const User = {
  findByEmail: async (email) => {
    const { rows } = await pool.query('SELECT u.*, sl.name as service_level_name FROM users u LEFT JOIN service_levels sl ON u.service_level_id = sl.id WHERE u.email = $1', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query('SELECT u.*, sl.name as service_level_name FROM users u LEFT JOIN service_levels sl ON u.service_level_id = sl.id WHERE u.id = $1', [id]);
    return rows[0];
  },

  create: async (name, email, hashedPassword, role, service_level_id) => {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, role, service_level_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, is_active, service_level_id',
      [name, email, hashedPassword, role, service_level_id]
    );
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query('SELECT u.*, sl.name as service_level_name FROM users u LEFT JOIN service_levels sl ON u.service_level_id = sl.id ORDER BY u.name ASC');
    return rows;
  },

  update: async (id, name, email, hashedPassword, role, is_active, service_level_id) => {
    const { rows } = await pool.query(
      'UPDATE users SET name = $1, email = $2, password = $3, role = $4, is_active = $5, service_level_id = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id, name, email, role, is_active, service_level_id',
      [name, email, hashedPassword, role, is_active, service_level_id, id]
    );
    return rows[0];
  },

  findAgents: async () => {
    const { rows } = await pool.query(
      'SELECT u.id, u.name, u.email, u.service_level_id, sl.name as service_level_name FROM users u LEFT JOIN service_levels sl ON u.service_level_id = sl.id WHERE u.role IN ($1, $2) AND u.is_active = TRUE ORDER BY u.name ASC',
      ['agent', 'admin']
    );
    return rows;
  },
};

module.exports = User;
