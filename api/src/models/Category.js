const { pool } = require('../config/database');

const Category = {
  create: async (name) => {
    const { rows } = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *'
      , [name]
    );
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows[0];
  },

  update: async (id, name) => {
    const { rows } = await pool.query(
      'UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *'
      , [name, id]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return rowCount;
  },
};

module.exports = Category;
