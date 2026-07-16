import cajaService from '../services/caja.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class CajaController {
  async getByTienda(req, res) {
    try {
      const tienda_id = req.query.tienda_id || req.user.tienda_id;
      const result = await cajaService.getByTienda(tienda_id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getActiva(req, res) {
    try {
      const tienda_id = req.user.tienda_id;
      if (!tienda_id) throw new Error('Usuario sin tienda asignada');

      const result = await cajaService.obtenerActiva(tienda_id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async abrirCaja(req, res) {
    try {
      const tienda_id = req.user.tienda_id || req.body.tienda_id;
      
      // Si el rol es admin, permitimos pasar un usuario_id diferente en el body
      const usuario_id = (req.user.rol === 'admin' && req.body.usuario_id) 
        ? req.body.usuario_id 
        : req.user.id;

      const result = await cajaService.abrirCaja(tienda_id, usuario_id, req.body);
      return sendSuccess(res, result, 'Caja abierta exitosamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async cerrarCaja(req, res) {
    try {
      const { id } = req.params;
      const result = await cajaService.cerrarCaja(id, req.user.id, req.body);
      return sendSuccess(res, result, 'Caja cerrada y arqueo completado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new CajaController();
