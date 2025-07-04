const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.min': 'O nome deve ter no mínimo {#limit} caracteres.',
    'string.empty': 'O campo de nome não pode estar vazio.',
    'any.required': 'O campo de nome é obrigatório.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'O email fornecido não é válido.',
    'string.empty': 'O campo de email não pode estar vazio.',
    'any.required': 'O campo de email é obrigatório.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'A senha deve ter no mínimo {#limit} caracteres.',
    'string.empty': 'O campo de senha não pode estar vazio.',
    'any.required': 'O campo de senha é obrigatório.'
  }),
  role: Joi.string().valid('user', 'admin', 'manager').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'O email fornecido não é válido.',
    'string.empty': 'O campo de email não pode estar vazio.',
    'any.required': 'O campo de email é obrigatório.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'O campo de senha não pode estar vazio.',
    'any.required': 'O campo de senha é obrigatório.'
  })
});

// Middleware de validação genérico
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({ message: errorMessages });
  }
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  validate
};
