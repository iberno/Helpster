/**
 * Middleware de tratamento de erros centralizado.
 * Ele captura qualquer erro passado para a função `next()`.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Ocorreu um erro:', err.stack);

  // Define um status de erro padrão
  const statusCode = err.statusCode || 500;

  // Define uma mensagem de erro padrão
  const message = err.message || 'Erro interno do servidor.';

  // Envia a resposta de erro formatada
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

module.exports = errorHandler;
