const { pool } = require('../config/database');

const setupDatabase = async () => {
  console.log('Iniciando a configuração do banco de dados para o Helpster...');
  try {
    // Tabela de Usuários (modificada para incluir o nome)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "users" verificada/criada.');

    // Adiciona a coluna 'name' se ela não existir (para migrações futuras)
    try {
      await pool.query('ALTER TABLE users ADD COLUMN name VARCHAR(255);');
      console.log('Coluna "name" adicionada à tabela "users".');
    } catch (e) {
      if (e.code !== '42701') throw e; // Ignora o erro se a coluna já existir
    }

    // Tabela de Categorias de Tickets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT
      );
    `);
    console.log('Tabela "categories" verificada/criada.');

    // Tabela de Tickets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Aberto',
        priority VARCHAR(50) NOT NULL DEFAULT 'Média',
        support_level VARCHAR(10) NOT NULL DEFAULT 'N1',
        client_id INTEGER NOT NULL REFERENCES users(id),
        agent_id INTEGER REFERENCES users(id),
        category_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "tickets" verificada/criada.');

    // Tabela de Comentários dos Tickets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        visibility VARCHAR(20) NOT NULL DEFAULT 'Público', -- 'Público' ou 'Interno'
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "comments" verificada/criada.');

    console.log('Configuração do banco de dados do Helpster concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
    process.exit(1);
  }
};

module.exports = { setupDatabase };
