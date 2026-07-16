import Joi from 'joi';

export const validateCrearEmpresa = (req, res, next) => {
  const schema = Joi.object({
    nombre_empresa: Joi.string().required().messages({
      'string.empty': 'El nombre de la empresa es requerido',
      'any.required': 'El nombre de la empresa es requerido'
    }),
    nombre_admin: Joi.string().required().messages({
      'string.empty': 'El nombre del administrador es requerido',
      'any.required': 'El nombre del administrador es requerido'
    }),
    username: Joi.string().required().messages({
      'string.empty': 'El username es requerido',
      'any.required': 'El username es requerido'
    }),
    email: Joi.string().email().allow('', null).optional(),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
    plan_id: Joi.number().integer().positive().optional(),
    referencia_pago: Joi.string().allow('', null).optional(),
    mensaje_ticket: Joi.string().allow('', null).optional(),
    whatsapp_enabled: Joi.boolean().optional()
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

export const validateEditarEmpresa = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().optional(),
    mensaje_ticket: Joi.string().optional(),
    whatsapp_enabled: Joi.boolean().optional(),
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

export const validateIdParam = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required()
  });

  const { error } = schema.validate({ id: req.params.id });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'ID de empresa inválido',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};

export const validateActualizarAdmin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).optional(),
    password: Joi.string().min(6).optional()
  }).min(1);

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
