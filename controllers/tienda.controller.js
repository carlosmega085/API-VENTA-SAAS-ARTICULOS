import tiendaService from '../services/tienda.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class TiendaController {
  async create(req, res) {
    try {
      const tienda = await tiendaService.create(req.empresa_id, req.body);
      return sendSuccess(res, tienda, 'Tienda creada exitosamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getAll(req, res) {
    try {
      const tiendas = await tiendaService.getAll(req.empresa_id);
      return sendSuccess(res, tiendas);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const tienda = await tiendaService.update(req.params.id, req.empresa_id, req.body);
      return sendSuccess(res, tienda, 'Tienda actualizada');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await tiendaService.delete(req.params.id, req.empresa_id);
      return sendSuccess(res, null, 'Tienda eliminada');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new TiendaController();
