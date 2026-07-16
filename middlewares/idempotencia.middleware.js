import { PeticionProcesada } from '../models/index.js';

/**
 * Middleware para asegurar la idempotencia de las peticiones.
 * Evita duplicados procesando la misma respuesta para un X-Request-ID idéntico.
 */
const idempotencia = async (req, res, next) => {
  // 1. La idempotencia solo es necesaria para métodos que cambian el estado (POST, PUT, DELETE)
  // No queremos "cachear" consultas GET como el historial.
  if (req.method === 'GET') {
    return next();
  }

  const requestId = req.headers['x-request-id'] || req.body?.request_id;
  
  if (!requestId) {
    return next();
  }

  try {
    // 1. Buscar si la petición ya fue procesada
    const peticion = await PeticionProcesada.findOne({
      where: { 
        request_id: requestId, 
        empresa_id: req.empresa_id 
      }
    });

    if (peticion) {
      console.log(`[IDEMPOTENCIA] Retornando respuesta cacheada para: ${requestId}`);
      return res.status(peticion.status_code).json(peticion.response);
    }

    // 2. Si no existe, interceptamos la respuesta para guardarla
    const originalJson = res.json;

    res.json = function (data) {
      // Solo guardamos si es una respuesta exitosa (2xx)
      // Aunque el usuario no lo especificó, es mejor guardar solo éxitos para permitir reintentos en fallos reales de validación
      if (res.statusCode >= 200 && res.statusCode < 300) {
        PeticionProcesada.create({
          request_id: requestId,
          endpoint: req.originalUrl,
          metodo: req.method,
          response: data,
          status_code: res.statusCode,
          empresa_id: req.empresa_id,
          usuario_id: req.user ? req.user.id : null
        }).catch(err => console.error('[ERROR IDEMPOTENCIA] No se pudo guardar la petición:', err));
      }

      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    console.error('[ERROR IDEMPOTENCIA]', error);
    next();
  }
};

export default idempotencia;
