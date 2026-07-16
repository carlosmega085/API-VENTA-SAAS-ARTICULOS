import Joi from 'joi';

export const createUsuarioSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid('admin', 'vendedor').default('vendedor'),
  tienda_id: Joi.number().integer().optional()
});

export const updateUsuarioSchema = Joi.object({
  nombre: Joi.string().min(3).max(100),
  username: Joi.string().min(3).max(50),
  email: Joi.string().email().allow(null, ''),
  password: Joi.string().min(6),
  rol: Joi.string().valid('admin', 'vendedor'),
  tienda_id: Joi.number().integer().allow(null),
  estado: Joi.string().valid('activo', 'inactivo')
});
