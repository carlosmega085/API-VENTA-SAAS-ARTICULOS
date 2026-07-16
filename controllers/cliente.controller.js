import clienteService from '../services/cliente.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class ClienteController {
  async create(req, res) {
    try {
      const result = await clienteService.create(req.empresa_id, req.body);
      return sendSuccess(res, result, 'Cliente creado', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getAll(req, res) {
    try {
      const result = await clienteService.getAll(req.empresa_id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await clienteService.update(id, req.empresa_id, req.body);
      return sendSuccess(res, result, 'Cliente actualizado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await clienteService.delete(id, req.empresa_id);
      return sendSuccess(res, null, 'Cliente eliminado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getHistorial(req, res) {
    try {
      const { id } = req.params;
      const result = await clienteService.getHistorial(id, req.empresa_id);
      return sendSuccess(res, result, 'Historial obtenido');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new ClienteController();
