import Joi from 'joi';

export const validateCrearSuscripcion = (req, res, next) => {
  const schema = Joi.object({
    empresa_id: Joi.number().integer().positive().required(),
    plan_id: Joi.number().integer().positive().required(),
    referencia_pago: Joi.string().optional(),
    imagen_pago: Joi.string().optional()
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

export const validateEstadoSuscripcion = (req, res, next) => {
  const schema = Joi.object({
    telefono: Joi.string().optional().messages({
      'string.empty': 'El teléfono es requerido si la empresa tiene WhatsApp habilitado para notificar'
    })
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

export const validateSuscripcionId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required()
  });

  const { error } = schema.validate({ id: req.params.id });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'ID de suscripción inválido',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};

export const validateEditarSuscripcion = (req, res, next) => {
  const schema = Joi.object({
    plan_id: Joi.number().integer().positive().optional(),
    estado: Joi.string().valid('pendiente', 'activa', 'rechazada').optional(),
    fecha_inicio: Joi.date().iso().optional(),
    fecha_fin: Joi.date().iso().optional(),
    referencia_pago: Joi.string().allow('', null).optional(),
    imagen_pago: Joi.string().allow('', null).optional(),
    estado_registro: Joi.string().valid('activo', 'inactivo').optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en la edición',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};
