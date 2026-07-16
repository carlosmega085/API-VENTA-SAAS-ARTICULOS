import { sendError } from '../utils/response.js';

/**
 * Middleware para controlar acciones específicas basadas en el JSON de permisos del usuario.
 * @param {string} accion - El nombre de la acción (ej: 'anular_venta', 'ajuste_stock')
 */
export const checkAction = (accion) => {
  return (req, res, next) => {
    const { user: usuario } = req;

    // Si es admin global o dueño de empresa, tiene permiso para todo por defecto
    if (!usuario || usuario.rol === 'admin') {
      return next();
    }

    const permisos = usuario.permisos || {};

    // Verificar si el permiso está explícitamente concedido (true)
    // Si no existe la llave o es false, se deniega.
    if (permisos[accion] === true) {
      return next();
    }

    return sendError(res, `No tienes permiso para realizar la acción: ${accion}`, 403);
  };
};

export default checkAction;
