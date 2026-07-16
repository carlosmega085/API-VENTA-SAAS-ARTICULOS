import Joi from 'joi';

export const validateCrearPlan = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().required(),
    precio: Joi.number().optional(),
    limite_usuarios: Joi.number().integer().min(1).optional(),
    limite_turnos: Joi.number().integer().min(1).optional(),
    limite_numeros: Joi.number().integer().min(1).optional(),
    max_vendedores_por_punto: Joi.number().integer().min(1).optional(),
    estado: Joi.string().valid('activo', 'inactivo').optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};

export const validateEditarPlan = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().optional(),
    precio: Joi.number().optional(),
    limite_usuarios: Joi.number().integer().min(1).optional(),
    limite_turnos: Joi.number().integer().min(1).optional(),
    limite_numeros: Joi.number().integer().min(1).optional(),
    max_vendedores_por_punto: Joi.number().integer().min(1).optional(),
    estado: Joi.string().valid('activo', 'inactivo').optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};

export const validatePlanId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required()
  });

  const { error } = schema.validate({ id: req.params.id });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'ID de plan inválido',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};
