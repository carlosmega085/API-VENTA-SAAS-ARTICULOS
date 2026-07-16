import usuarioService from '../services/usuario.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class UsuarioController {
  async getAll(req, res) {
    try {
      const result = await usuarioService.getAll(req.empresa_id);
      return sendSuccess(res, result, 'Usuarios obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const result = await usuarioService.create(req.empresa_id, req.body);
      return sendSuccess(res, result, 'Usuario creado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const result = await usuarioService.update(req.params.id, req.empresa_id, req.body);
      return sendSuccess(res, result, 'Usuario actualizado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await usuarioService.delete(req.params.id, req.empresa_id);
      return sendSuccess(res, null, 'Usuario desactivado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new UsuarioController();
