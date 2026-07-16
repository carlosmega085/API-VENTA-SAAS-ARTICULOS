import gastoService from '../services/gasto.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class GastoController {
  async registrarGasto(req, res) {
    try {
      const { empresa_id, id: usuario_id, tienda_id } = req.user;
      const gasto = await gastoService.registrarGasto(
        empresa_id, 
        tienda_id, 
        usuario_id, 
        req.body
      );
      return sendSuccess(res, gasto, 'Gasto registrado correctamente', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async listarGastos(req, res) {
    try {
      const { tienda_id } = req.user;
      const gastos = await gastoService.consultarGastos(tienda_id, req.query);
      return sendSuccess(res, gastos, 'Gastos obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new GastoController();
