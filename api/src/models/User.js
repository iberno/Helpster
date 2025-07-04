const { pool } = require('../config/database');

const createUserTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Tabela \'users\' criada ou já existente.');
  } catch (error) {
    console.error('Erro ao criar a tabela de usuários:', error);
    throw error;
  }
};

module.exports = { createUserTable };
