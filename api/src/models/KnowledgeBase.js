const { pool } = require('../config/database');

const KnowledgeBase = {
  createArticle: async (title, content, author_id) => {
    const { rows } = await pool.query(
      'INSERT INTO knowledge_base_articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *'
      , [title, content, author_id]
    );
    return rows[0];
  },

  findAllArticles: async () => {
    const { rows } = await pool.query(
      'SELECT kba.*, u.name as author_name FROM knowledge_base_articles kba JOIN users u ON kba.author_id = u.id ORDER BY kba.created_at DESC'
    );
    return rows;
  },

  findArticleById: async (id) => {
    const { rows } = await pool.query(
      'SELECT kba.*, u.name as author_name FROM knowledge_base_articles kba JOIN users u ON kba.author_id = u.id WHERE kba.id = $1'
      , [id]
    );
    return rows[0];
  },

  updateArticle: async (id, title, content) => {
    const { rows } = await pool.query(
      'UPDATE knowledge_base_articles SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *'
      , [title, content, id]
    );
    return rows[0];
  },

  deleteArticle: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM knowledge_base_articles WHERE id = $1', [id]);
    return rowCount;
  },
};

module.exports = KnowledgeBase;
