const jwt = require('jsonwebtoken');

// Suposição: O modelo de usuário tem um campo 'role' (ex: 'user', 'admin')
// const User = require('../models/User'); 

/**
 * Middleware para verificar o token JWT.
 * Se o token for válido, anexa os dados do usuário (payload) à requisição.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    req.user = userPayload; // Anexa o payload (ex: { id: 1, role: 'admin' })
    next();
  });
};

/**
 * Middleware de autorização baseado em roles.
 * @param {Array<string>} allowedRoles - Um array de roles que têm permissão.
 */
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    // O middleware authenticateToken deve ter sido executado antes
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Acesso proibido. Role não definida.' });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Acesso proibido. Você não tem permissão para acessar este recurso.' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};