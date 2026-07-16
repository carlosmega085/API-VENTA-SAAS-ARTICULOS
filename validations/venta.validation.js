import Joi from 'joi';

export const createVentaSchema = Joi.object({
  tienda_id: Joi.number().integer().optional(), // Si no viene, se usa la del usuario
  caja_id: Joi.number().integer().when('tipo_pago', {
    is: 'contado',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  cliente_id: Joi.number().integer().when('tipo_pago', {
    is: 'credito',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  tipo_pago: Joi.string().valid('contado', 'credito').required(),
  metodo_pago: Joi.string().valid('efectivo', 'tarjeta', 'transferencia', 'otro').required(),
  items: Joi.array().items(
    Joi.object({
      producto_variante_id: Joi.number().integer().required(),
      cantidad: Joi.number().integer().positive().required()
    })
  ).min(1).required(),
  request_id: Joi.string().uuid().optional()
});
