// Importar dependências
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB } = require('./src/config/database');
const { createUserTable } = require('./src/models/User');
const routes = require('./src/routes/routes');

// Conectar ao banco de dados e criar tabelas
const startServer = async () => {
  await connectDB();
  await setupDatabase();
};

startServer();

// Inicializar a aplicação Express
const app = express();

const errorHandler = require('./src/middlewares/errorHandler');

// Middlewares essenciais
app.use(cors()); // Permite requisições de outras origens
app.use(helmet()); // Adiciona headers de segurança
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Rota de health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

app.use('/api', routes);

// Middleware de Tratamento de Erros (deve ser o último)
app.use(errorHandler);


// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});