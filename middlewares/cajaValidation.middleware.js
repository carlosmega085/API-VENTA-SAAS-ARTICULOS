import { Caja } from '../models/index.js';
import { sendError } from '../utils/response.js';

/**
 * Middleware para validar que el usuario tenga una caja abierta antes de operar.
 * Se aplica a Ventas (contado), Gastos y Abonos.
 */
export const validarCajaAbierta = async (req, res, next) => {
  try {
    const { id: usuario_id, tienda_id } = req.user;
    const { caja_id } = req.body;

    // Si la petición trae caja_id, validamos que esa caja específica esté abierta
    let caja;
    if (caja_id) {
      caja = await Caja.findOne({
        where: { id: caja_id, tienda_id, estado: 'abierta' }
      });
    } else {
      // Si no trae caja_id, buscamos si el usuario tiene una caja abierta en esta tienda
      caja = await Caja.findOne({
        where: { tienda_id, usuario_id, estado: 'abierta' }
      });
    }

    if (!caja) {
      return sendError(res, 'Operación denegada: Debe tener una caja abierta para procesar movimientos de dinero.', 400);
    }

    // Inyectamos la caja_id encontrada en el body por si el controlador la necesita
    req.body.caja_id = caja.id;
    next();
  } catch (error) {
    return sendError(res, 'Error al validar estado de caja');
  }
};

export default validarCajaAbierta;
