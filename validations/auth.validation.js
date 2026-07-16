import Joi from 'joi';

export const registerEmpresaSchema = Joi.object({
  nombre_empresa: Joi.string().min(3).max(100).required(),
  nombre_admin: Joi.string().min(3).max(100).required(),
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().optional().allow('', null),
  password: Joi.string().min(6).required(),
  plan_id: Joi.number().required(),
  referencia_pago: Joi.string().optional().allow('', null)
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});
