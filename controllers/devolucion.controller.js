import devolucionService from '../services/devolucion.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class DevolucionController {
  async procesarDevolucion(req, res) {
    try {
      const { empresa_id, id: usuario_id, tienda_id } = req.user;
      const devolucion = await devolucionService.procesarDevolucion(
        empresa_id,
        tienda_id,
        usuario_id,
        req.body
      );
      return sendSuccess(res, devolucion, 'Devolución procesada con éxito', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async listarDevoluciones(req, res) {
    try {
      const { empresa_id } = req.user;
      // Admite tienda_id opcional por query
      const tienda_id = req.query.tienda_id || req.user.tienda_id;
      
      const devoluciones = await devolucionService.listarDevoluciones(empresa_id, { 
        ...req.query,
        tienda_id 
      });
      return sendSuccess(res, devoluciones);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async obtenerDetalle(req, res) {
    try {
      const { id } = req.params;
      const devolucion = await devolucionService.obtenerDevolucionPorId(id);
      return sendSuccess(res, devolucion);
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new DevolucionController();
