import Joi from 'joi';

const productoSchema = Joi.object({
  productData: Joi.object({
    nombre: Joi.string().required().messages({
      'string.empty': 'El nombre del producto no puede estar vacío',
      'any.required': 'El nombre del producto es obligatorio'
    }),
    categoria_id: Joi.number().required().messages({
      'any.required': 'La categoría es obligatoria',
      'number.base': 'La categoría debe ser un ID válido'
    }),
    descripcion: Joi.string().allow('', null),
    marca: Joi.string().allow('', null),
    codigo_barra: Joi.string().allow('', null),
    codigo_barras: Joi.string().allow('', null)
  }).required().messages({
    'any.required': 'Los datos base del producto (productData) son obligatorios'
  }),
  
  variantsData: Joi.array().items(
    Joi.object({
      id: Joi.number().optional(), // Para updates
      sku: Joi.string().allow('', null),
      codigo_barra: Joi.string().allow('', null),
      codigo_barras: Joi.string().allow('', null),
      precio_venta: Joi.number().min(0).required().messages({
        'number.min': 'El precio de venta no puede ser negativo',
        'any.required': 'El precio de venta es obligatorio en cada variante'
      }),
      costo: Joi.number().min(0).required().messages({
        'number.min': 'El costo no puede ser negativo',
        'any.required': 'El costo es obligatorio en cada variante'
      }),
      imagen_url: Joi.string().allow('', null),
      fileIndex: Joi.number().optional().allow(null),
      atributo_valor_ids: Joi.array().items(Joi.number()).messages({
        'array.base': 'Los atributos deben enviarse como una lista de IDs'
      })
    })
  ).min(1).required().messages({
    'array.min': 'Se requiere al menos una variante para el producto',
    'any.required': 'La lista de variantes (variantsData) es obligatoria'
  })
});

export { productoSchema };
