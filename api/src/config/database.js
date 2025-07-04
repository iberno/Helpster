const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Conectado ao PostgreSQL com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar com o PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };